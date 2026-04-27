const usermodel = require("../model/form-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.googleClientId,
  process.env.googleClientSecret,
  "postmessage",
);
const CLIENT_ID = process.env.googleClientId;
const {
  sendEmail,
  sendForgotPasswordEmail,
} = require("../utils/send-to-email.js");
const generateOTP = require("otp-generator");

const generate = async () => {
  const code = generateOTP.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return code;
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please Sign In with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = await jwt.sign(
      { email: user.email },
      process.env.jwtSecretKey,
      {
        expiresIn: 60 * 60,
      },
    );

    const verified = await usermodel.findOneAndUpdate(
      { email: user.email },
      { token },
      { new: true },
    );

    if (!verified) {
      return res.status(400).json({ message: "Failed to generate token" });
    }
    console.log(verified);

    return res.status(200).json({
      message: "Login Successful",
      data: { email: user.email, token },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const signup = async (req, res) => {
  const { email, password, userName, number, profileImage } = req.body;
  if (!email || !password || !userName || !number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await usermodel.create({
      email,
      password: hashedPassword,
      userName,
      number,
      profileImage,
    });

    const code = await generate();
    const updatedUser = await usermodel.findOneAndUpdate(
      { email: user.email },
      { otp: code, otpExpiry: Date.now() + 10 * 60 * 1000 },
      { new: true },
    );

    const send = await sendEmail(user.email, code, user.userName);
    if (!send) {
      return res.status(400).json({ message: "Failed to send OTP email" });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your email for verification" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.googleSub) {
      return res
        .status(400)
        .json({ message: "Please Sign In with google instead" });
    }
    const code = await generate();
    const updatedUser = await usermodel.findOneAndUpdate(
      { email: user.email },
      { otp: code, otpExpiry: Date.now() + 10 * 60 * 1000 },
      { new: true },
    );

    const send = await sendForgotPasswordEmail(user.email, code, user.userName);
    if (!send) {
      return res.status(400).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      message: "OTP sent to your email for password reset",
      data: updatedUser.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token is required" });
    const jwtVerify = await jwt.verify(token, process.env.jwtSecretKey);
    if (!jwtVerify) return res.status(400).json({ message: "Invalid Token" });

    const find = await usermodel.findOne({ email: jwtVerify.email });
    console.log(find);
    res.status(200).json({ message: "Token is valid", data: find });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ message: "Token verification failed" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otpExpiry < Date.now()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp != +otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log(user);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const driverSignup = async (req, res) => {
  const {
    email,
    password,
    userName,
    number,
    profileImage,
    plateNumber,
    carBrand,
    carModel,
    carYear,
    carImage,
  } = req.body;
  if (
    !email ||
    !password ||
    !userName ||
    !number ||
    !plateNumber ||
    !carBrand ||
    !carModel ||
    !carYear ||
    !carImage
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await usermodel.create({
      email,
      password: hashedPassword,
      userName,
      number,
      profileImage,
      plateNumber,
      carBrand,
      carYear,
      carModel,
      carImage,
    });

    const code = await generate();
    const updatedUser = await usermodel.findOneAndUpdate(
      { email: user.email },
      { otp: code, otpExpiry: Date.now() + 10 * 60 * 1000 },
      { new: true },
    );

    const send = await sendEmail(user.email, code, user.userName);
    if (!send) {
      return res.status(400).json({ message: "Failed to send OTP email" });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your email for verification" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyGoogleToken = async (req, res) => {
  const { code } = req.body;
  console.log(code);
  try {
    const { tokens } = await client.getToken(code);
    console.log(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: userId, email, name, picture: profileImage } = payload;

    let user = await usermodel.findOne({ email });

    // If user doesn't exist, create them
    if (!user) {
      user = await usermodel.create({
        email,
        userName: name,
        profileImage,
        googleSub: userId,
      });

      if (!user) {
        return res.status(400).json({ message: "Failed to create user" });
      }
    }

    const token = jwt.sign({ email }, process.env.jwtSecretKey, {
      expiresIn: 60 * 60,
    });

    await usermodel.findOneAndUpdate({ email }, { token });

    return res.status(200).json({
      message: "Login Successful",
      data: { email: user.email, token },
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid Google Token" });
  }
};

module.exports = {
  signup,
  login,
  driverSignup,
  forgetPassword,
  verifyOTP,
  verifyToken,
  verifyGoogleToken,
};
