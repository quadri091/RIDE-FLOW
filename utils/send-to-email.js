const nodemailer = require("nodemailer");

const sendEmail = async (email, code, username) => {
  const messageTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ride-Flow - Verification Code</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background-color: #0a0114;
    "
  >
    <table
      role="presentation"
      style="width: 100%; border-collapse: collapse; background-color: #0a0114"
    >
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table
            role="presentation"
            style="
              max-width: 600px;
              width: 100%;
              border-collapse: collapse;
              background-color: #0d0221;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid rgba(255, 255, 255, 0.125);
            "
          >
            <tr>
              <td
                style="
                  padding: 40px 40px 30px 40px;
                  text-align: center;
                  background: linear-gradient(to bottom, #1a0438, #0d0221);
                "
              >
                <table role="presentation" style="margin: 0 auto">
                  <tr>
                    <td>
                      <div
                        style="
                          width: 60px;
                          height: 60px;
                          margin: 0 auto 15px;
                          border-radius: 15px;
                          background: linear-gradient(
                            to left top,
                            #4826a5,
                            #4f7fe6
                          );
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="32px"
                          viewBox="0 -960 960 960"
                          width="32px"
                          fill="#ffffff"
                        >
                          <path
                            d="M155-195q-35-35-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35q-50 0-85-35Zm113.5-56.5Q280-263 280-280t-11.5-28.5Q257-320 240-320t-28.5 11.5Q200-297 200-280t11.5 28.5Q223-240 240-240t28.5-11.5ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm628.5 108.5Q760-263 760-280t-11.5-28.5Q737-320 720-320t-28.5 11.5Q680-297 680-280t11.5 28.5Q703-240 720-240t28.5-11.5ZM680-440h170l-90-120h-80v120ZM360-540Z"
                          />
                        </svg>
                      </div>
                      <h1
                        style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 28px;
                          font-weight: bold;
                        "
                      >
                        Ride-Flow
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 40px 40px 40px">
                <div
                  style="
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background-color: rgba(255, 255, 255, 0.03);
                    border-radius: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                  "
                >
                  <p
                    style="
                      margin: 0;
                      color: #a7fa2b;
                      font-size: 12px;
                      text-transform: uppercase;
                      letter-spacing: 2px;
                      font-weight: bold;
                    "
                  >
                    Account Details
                  </p>
                  <h3
                    style="
                      margin: 10px 0 5px 0;
                      color: #ffffff;
                      font-size: 22px;
                      font-weight: normal;
                    "
                  >
                    Hello, <span style="font-weight: bold">{${username}}</span>
                  </h3>
                  <p style="margin: 0; color: #989595; font-size: 15px">
                    {${email}}
                  </p>
                </div>

                <h2
                  style="
                    margin: 0 0 15px 0;
                    color: #ffffff;
                    font-size: 28px;
                    text-align: center;
                  "
                >
                  Verify Your Account
                </h2>
                <p
                  style="
                    margin: 0 0 30px 0;
                    color: #989595;
                    font-size: 16px;
                    line-height: 24px;
                    text-align: center;
                  "
                >
                  Use the verification code below to complete your sign-in. This
                  code will expire in
                  <strong style="color: #a7fa2b">10 minutes</strong>.
                </p>

                <table role="presentation" style="width: 100%; margin: 30px 0">
                  <tr>
                    <td align="center">
                      <div
                        style="
                          background: linear-gradient(
                            to left top,
                            #4826a5,
                            #4f7fe6
                          );
                          padding: 3px;
                          border-radius: 15px;
                          display: inline-block;
                          box-shadow: 0 0 40px rgba(63, 45, 182, 0.3);
                        "
                      >
                        <div
                          style="
                            background-color: #160338;
                            padding: 25px 50px;
                            border-radius: 13px;
                          "
                        >
                          <span
                            style="
                              font-size: 42px;
                              font-weight: bold;
                              color: #ffffff;
                              letter-spacing: 12px;
                              font-family: &quot;Courier New&quot;, monospace;
                            "
                          >
                            {${code}}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 30px 0 0 0;
                    color: #989595;
                    font-size: 14px;
                    text-align: center;
                    line-height: 22px;
                  "
                >
                  If you're having trouble reading the code, copy and paste
                  this: <br />
                  <strong
                    style="color: #ffffff; font-size: 16px; letter-spacing: 2px"
                    >{${code}}</strong
                  >
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 40px 40px">
                <table
                  role="presentation"
                  style="
                    width: 100%;
                    background-color: rgba(82, 63, 205, 0.1);
                    border-radius: 12px;
                    border: 1px solid rgba(82, 63, 205, 0.2);
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <p
                        style="
                          margin: 0 0 10px 0;
                          color: #ffffff;
                          font-size: 15px;
                          font-weight: bold;
                        "
                      >
                        🔒 Security Tips
                      </p>
                      <ul
                        style="
                          margin: 0;
                          padding-left: 20px;
                          color: #989595;
                          font-size: 14px;
                          line-height: 20px;
                        "
                      >
                        <li>Never share this code with anyone</li>
                        <li>Ride-Flow staff will never ask for this code</li>
                        <li>
                          If you didn't request this code, please ignore this
                          email
                        </li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 30px 40px;
                  background-color: #0a0814;
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                "
              >
                <p
                  style="
                    margin: 0 0 15px 0;
                    color: #666666;
                    font-size: 12px;
                    text-align: center;
                    line-height: 18px;
                  "
                >
                  This email was sent from Ride-Flow. If you have any questions,
                  please contact our support team.
                </p>
                <p
                  style="
                    margin: 0;
                    color: #666666;
                    font-size: 12px;
                    text-align: center;
                  "
                >
                  © 2026 Ride-Flow. All rights reserved.
                </p>

                <table
                  role="presentation"
                  style="margin: 20px auto 0; border-collapse: collapse"
                >
                  <tr>
                    <td style="padding: 0 8px">
                      <a
                        href="#"
                        style="
                          color: #666666;
                          font-size: 11px;
                          text-decoration: none;
                        "
                        >Help Center</a
                      >
                    </td>
                    <td style="padding: 0 8px; color: #666666">|</td>
                    <td style="padding: 0 8px">
                      <a
                        href="#"
                        style="
                          color: #666666;
                          font-size: 11px;
                          text-decoration: none;
                        "
                        >Privacy Policy</a
                      >
                    </td>
                    <td style="padding: 0 8px; color: #666666">|</td>
                    <td style="padding: 0 8px">
                      <a
                        href="#"
                        style="
                          color: #666666;
                          font-size: 11px;
                          text-decoration: none;
                        "
                        >Terms</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Your OTP Code",
    html: messageTemplate,
  };

  try {
    const sentEmail = await transporter.sendMail(mailOptions);
    if (sentEmail) {
      return "Mail sent";
    }
  } catch (error) {
    console.log(error);
    return "Failed to send mail";
  }
};

const sendForgotPasswordEmail = async (email, code, username) => {
  const messageTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ride-Flow - Reset Password</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background-color: #0a0114;
    "
  >
    <table
      role="presentation"
      style="width: 100%; border-collapse: collapse; background-color: #0a0114"
    >
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table
            role="presentation"
            style="
              max-width: 600px;
              width: 100%;
              border-collapse: collapse;
              background-color: #0d0221;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid rgba(255, 255, 255, 0.125);
            "
          >
            <!-- HEADER -->
            <tr>
              <td
                style="
                  padding: 40px;
                  text-align: center;
                  background: linear-gradient(to bottom, #1a0438, #0d0221);
                "
              >
                <div
                  style="
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 15px;
                    border-radius: 15px;
                    background: linear-gradient(to left top, #4826a5, #4f7fe6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="32px"
                          viewBox="0 -960 960 960"
                          width="32px"
                          fill="#ffffff"
                        >
                          <path
                            d="M155-195q-35-35-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35q-50 0-85-35Zm113.5-56.5Q280-263 280-280t-11.5-28.5Q257-320 240-320t-28.5 11.5Q200-297 200-280t11.5 28.5Q223-240 240-240t28.5-11.5ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm628.5 108.5Q760-263 760-280t-11.5-28.5Q737-320 720-320t-28.5 11.5Q680-297 680-280t11.5 28.5Q703-240 720-240t28.5-11.5ZM680-440h170l-90-120h-80v120ZM360-540Z"
                          />
                        </svg>
                </div>

                <h1 style="margin: 0; color: #ffffff; font-size: 28px">
                  Ride-Flow
                </h1>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding: 20px 40px 40px 40px">
                <div
                  style="
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background-color: rgba(255, 255, 255, 0.03);
                    border-radius: 15px;
                  "
                >
                  <p style="color: #a7fa2b; font-size: 12px; letter-spacing: 2px">
                    PASSWORD RESET REQUEST
                  </p>

                  <h3 style="color: #ffffff">
                    Hello, <b>{${username}}</b>
                  </h3>
                  <p style="color: #989595">{${email}}</p>
                </div>

                <h2
                  style="
                    color: #ffffff;
                    text-align: center;
                    font-size: 26px;
                  "
                >
                  Reset Your Password
                </h2>

                <p
                  style="
                    color: #989595;
                    text-align: center;
                    line-height: 24px;
                  "
                >
                  We received a request to reset your password. Use the code
                  below to create a new password. This code will expire in
                  <strong style="color: #a7fa2b">10 minutes</strong>.
                </p>

                <!-- CODE -->
                <div style="text-align: center; margin: 30px 0">
                  <div
                    style="
                      display: inline-block;
                      padding: 3px;
                      border-radius: 15px;
                      background: linear-gradient(to left top, #4826a5, #4f7fe6);
                    "
                  >
                    <div
                      style="
                        padding: 25px 50px;
                        border-radius: 13px;
                        background-color: #160338;
                      "
                    >
                      <span
                        style="
                          font-size: 42px;
                          color: #ffffff;
                          letter-spacing: 12px;
                          font-family: monospace;
                        "
                      >
                        {${code}}
                      </span>
                    </div>
                  </div>
                </div>

                <p style="text-align: center; color: #989595">
                  Or copy this code:
                  <br />
                  <strong style="color: #ffffff">{${code}}</strong>
                </p>
              </td>
            </tr>

            <!-- SECURITY -->
            <tr>
              <td style="padding: 0 40px 40px">
                <div
                  style="
                    background-color: rgba(82, 63, 205, 0.1);
                    padding: 20px;
                    border-radius: 12px;
                  "
                >
                  <p style="color: #ffffff"><b>🔒 Security Tips</b></p>
                  <ul style="color: #989595">
                    <li>Do not share this code with anyone</li>
                    <li>Ride-Flow will never ask for your password</li>
                    <li>
                      If you didn’t request this, you can safely ignore this
                      email
                    </li>
                  </ul>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td
                style="
                  padding: 30px;
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                  background-color: #0a0814;
                "
              >
                © 2026 Ride-Flow. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Your OTP Code",
    html: messageTemplate,
  };

  try {
    const sentEmail = await transporter.sendMail(mailOptions);
    if (sentEmail) {
      return "Mail sent";
    }
  } catch (error) {
    console.log(error);
    return "Failed to send mail";
  }
};

module.exports = { sendEmail, sendForgotPasswordEmail };
