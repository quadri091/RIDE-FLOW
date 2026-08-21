const tripModel = require("../model/trip-model.js");
const totaltripModel = require("../model/totaltrip-model.js");
const axios = require("axios");
const usermodel = require("../model/form-model.js");
const { getSocketsByUserId } = require("../socket.js");
const generateMatchCode = async () => {
  const lastTrip = await totaltripModel
    .findOne()
    .sort({ createdAt: -1 })
    .select("matchCode");

  if (!lastTrip || !lastTrip.matchCode) {
    return "T-1001";
  }

  const lastNum = parseInt(lastTrip.matchCode.split("-")[1]);
  return `T-${lastNum + 1}`;
};

const broadCastTrip = async (io, room, path, data) => {
  io.to(room).emit(path, data);
};

const createTrip = async (req, res) => {
  const { startCoordinates, endCoordinates, startAddress, endAddress, price } =
    req.body;

  if (!startCoordinates || !endCoordinates) {
    return res
      .status(400)
      .json({ message: "Start and end coordinates are required" });
  }

  try {
    const osrmResponse = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?geometries=geojson&overview=full`,
    );

    const route = osrmResponse.data.routes[0];
    if (!route) {
      return res
        .status(404)
        .json({ message: "No route found between these locations" });
    }

    let matchCode = await generateMatchCode();
    let codeExists = await tripModel.findOne({ matchCode });
    while (codeExists) {
      matchCode = await generateMatchCode();
      codeExists = await tripModel.findOne({ matchCode });
    }

    const trip = await tripModel.create({
      rider: {
        id: req.user.id,
        name: req.user.userName,
        number: req.user.number,
      },
      price: price || "",
      matchCode: matchCode,
      startLocation: {
        coordinates: startCoordinates,
        address: startAddress || "",
      },
      endLocation: {
        coordinates: endCoordinates,
        address: endAddress || "",
      },
      routeCoordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
      status: "available",
    });

    if (!trip) {
      return res.status(400).json({ message: "Error creating account" });
    }

    await totaltripModel.create({
      rider: {
        id: req.user.id.toString(),
        name: req.user.userName,
        number: req.user.number,
      },
      price: price || 0,
      matchCode: matchCode,
      startLocation: {
        coordinates: startCoordinates,
        address: startAddress || "",
      },
      endLocation: {
        coordinates: endCoordinates,
        address: endAddress || "",
      },
      routeCoordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
      status: "available",
    });

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:created", trip);
    io.to("drivers").emit("trip:created", trip);
    io.to("admins").emit("trip:created", trip);

    return res.status(200).json({
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const assignTrip = async (req, res) => {
  const { userId, matchCode } = req.body;
  if (!userId || !matchCode) {
    return res
      .status(400)
      .json({ message: "User Id and Match Code are required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.rider.id.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the rider can assign a driver" });
    }

    if (trip.status !== "available") {
      return res.status(400).json({ message: "Trip is no longer available" });
    }

    const driver = await usermodel.findById(userId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.role !== "driver") {
      return res.status(400).json({ message: "This user is not a driver" });
    }

    if (trip.driver?.id) {
      return res
        .status(400)
        .json({ message: "Trip already has a driver assigned" });
    }
    if (trip.assigned?.id) {
      return res.status(400).json({
        message: "You already have someone assigned to the Trip",
        status: "assigned akready",
      });
    }

    const update = {
      id: driver.id.toString(),
      name: driver.userName,
      number: driver.number,
      appliedAt: new Date(),
    };
    const updatedTrip = await tripModel.findOneAndUpdate(
      { matchCode },
      { $set: { assigned: update, status: "available" } },
      { new: true },
    );

    await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { assigned: update, status: "available" } },
      { new: true },
    );

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:assigned", updatedTrip);
    const socket1 = getSocketsByUserId(trip.rider.id.toString());
    const socket2 = getSocketsByUserId(driver.id.toString());
    io.to(socket2).emit("trip:assigned", updatedTrip);
    io.to(socket1).emit("trip:assigned", updatedTrip);
    let respond;
    const find = await usermodel.findById(trip?.rider?.id);

    if (find) {
      setTimeout(
        async () => {
          respond = await autoDeleteAssign(req, matchCode, update.id);
        },
        +find.assignTimeOut * 60 * 1000,
      );
    }

    return res.status(200).json({
      message: "Trip assigned successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const applyTrip = async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.status !== "available") {
      return res.status(400).json({ message: "Trip is no longer available" });
    }

    if (trip.driver?.id) {
      return res
        .status(400)
        .json({ message: "Trip already has a driver assigned" });
    }

    const alreadyApplied = trip.applicants.find(
      (a) => a.id.toString() === req.user.id.toString(),
    );

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You already applied for this trip" });
    }

    const update = [
      ...trip.applicants,
      {
        id: req.user.id.toString(),
        name: req.user.userName,
        number: req.user.number,
      },
    ];

    const updatedTrip = await tripModel.findOneAndUpdate(
      { matchCode },
      { $set: { applicants: update, status: "available" } },
      { new: true },
    );

    await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { applicants: update, status: "available" } },
      { new: true },
    );

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:updated", updatedTrip);
    const socket1 = getSocketsByUserId(req.user.id.toString());
    const socket2 = getSocketsByUserId(trip.rider.id.toString());
    io.to(socket1).emit("trip:updated", updatedTrip);
    io.to(socket2).emit("trip:updated", updatedTrip);

    return res.status(200).json({
      message: "Applied for trip successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const acceptTrip = async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.assigned?.id?.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the assigned driver can accept" });
    }

    if (trip.status !== "available") {
      return res.status(400).json({ message: "Trip is no longer available" });
    }
    const update = {
      id: req.user.id.toString(),
      name: req.user.userName,
      number: req.user.number,
    };

    const updatedTrip = await tripModel.findOneAndUpdate(
      { matchCode },
      { $set: { driver: update, assigned: {}, status: "accepted" } },

      { new: true },
    );

    await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { driver: update, assigned: {}, status: "accepted" } },

      { new: true },
    );

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:accepted", updatedTrip);
    const socket1 = getSocketsByUserId(trip.rider.id.toString());
    const socket2 = getSocketsByUserId(req.user.id.toString());
    io.to(socket1).emit("trip:accepted", updatedTrip);
    io.to(socket2).emit("trip:accepted", updatedTrip);

    const find = await usermodel.findById(trip?.rider?.id);
    if (find) {
      setTimeout(
        async () => {
          await autoDeleteAccept(req, matchCode, req.user.id.toString());
        },
        +find.acceptTimeOut * 60 * 1000,
      );
    }
    return res.status(200).json({
      message: "Trip accepted successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const autoDeleteAssign = async (req, matchCode, driverId) => {
  if (!matchCode.trim() || !driverId.trim()) {
    return { text: "Match code and driver Id is required", code: 1 };
  }

  try {
    const find = await tripModel.findOne({ matchCode });
    if (
      find &&
      find?.assigned?.id?.toString() == driverId &&
      (find.status == "available" || find.status == "accepted")
    ) {
      const updatedTrip = await tripModel.findOneAndUpdate(
        { matchCode },
        { $set: { driver: {}, assigned: {}, status: "available" } },

        { new: true },
      );

      await totaltripModel.findOneAndUpdate(
        { matchCode },
        { $set: { driver: {}, assigned: {}, status: "available" } },

        { new: true },
      );

      const io = req.app.get("io");
      await broadCastTrip(io, "admins", "trip:auto-remove-assign", updatedTrip);
      const socket1 = getSocketsByUserId(find.rider.id.toString());
      const socket2 = getSocketsByUserId(driverId.toString());
      io.to(socket2).emit("trip:auto-remove-assign", updatedTrip);
      io.to(socket1).emit("trip:auto-remove-assign", updatedTrip);
      return { text: "auto-remove-assign", code: 2 };
    } else {
      if (!find) {
        return { text: "Trip not found", code: 3 };
      }

      const io = req.app.get("io");
      await broadCastTrip(
        io,
        "admins",
        "trip:failed-to-auto-delete",
        `Driver: ${driverId} is not assigned to this trip`,
      );

      const socket1 = getSocketsByUserId(find.rider.id.toString());
      io.to(socket1).emit(
        "trip:failed-to-auto-delete",
        `Driver: ${driverId} is not assigned to this trip`,
      );

      return { text: "failed", code: 3 };
    }
  } catch (error) {
    return { text: "Internal Server error", code: 4 };
  }
};
const autoDeleteAccept = async (req, matchCode, driverId) => {
  if (!matchCode.trim() || !driverId.trim()) {
    return { text: "Match code and driver Id is required", code: 1 };
  }

  try {
    const find = await tripModel.findOne({ matchCode });
    if (
      find &&
      find.driver?.id?.toString() == driverId.toString() &&
      find.status == "accepted"
    ) {
      const updatedTrip = await tripModel.findOneAndUpdate(
        { matchCode },
        { $set: { driver: {}, assigned: {}, status: "available" } },
        { new: true },
      );

      await totaltripModel.findOneAndUpdate(
        { matchCode },
        { $set: { driver: {}, assigned: {}, status: "available" } },
        { new: true },
      );
      const io = req.app.get("io");
      await broadCastTrip(io, "admins", "trip:auto-delete-accept", updatedTrip);
      const socket1 = getSocketsByUserId(driverId.toString());
      const socket2 = getSocketsByUserId(find.rider.id.toString());
      io.to(socket1).emit("trip:auto-delete-accept", updatedTrip);
      io.to(socket2).emit("trip:auto-delete-accept", updatedTrip);
      return { text: "auto-delete-accept", code: 2 };
    }
    return { text: "failed", code: 3 };
  } catch (error) {
    return { text: "Internal Server error", code: 4 };
  }
};

const declineTrip = async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.assigned?.id?.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the assigned driver can decline" });
    }

    if (trip.status !== "available") {
      return res.status(400).json({ message: "Trip is no longer available" });
    }

    const declined = trip.declinedBy;
    declined.push(req.user.id.toString());

    const updatedTrip = await tripModel.findOneAndUpdate(
      { matchCode },
      { $set: { declinedBy: declined, status: "available", assigned: {} } },
      { new: true },
    );

    await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { declinedBy: declined, status: "available", assigned: {} } },
      { new: true },
    );

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:declined", updatedTrip);
    const socket1 = getSocketsByUserId(req.user.id.toString());
    const socket2 = getSocketsByUserId(trip.rider.id.toString());
    io.to(socket1).emit("trip:declined", updatedTrip);
    io.to(socket2).emit("trip:declined", updatedTrip);

    return res.status(200).json({
      message: "Trip declined successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const startTrip = async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.driver?.id?.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the assigned driver can start the trip" });
    }

    if (trip.status !== "accepted") {
      return res.status(400).json({ message: "Trip is not ready to start" });
    }

    const updatedTrip = await tripModel.findOneAndUpdate(
      { matchCode },
      { $set: { status: "trip started" } },
      { new: true },
    );

    await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { status: "trip started" } },
      { new: true },
    );

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:started", updatedTrip);
    const socket1 = getSocketsByUserId(req.user.id.toString());
    const socket2 = getSocketsByUserId(trip.rider.id.toString());
    io.to(socket1).emit("trip:started", updatedTrip);
    io.to(socket2).emit("trip:started", updatedTrip);

    return res.status(200).json({
      message: "Trip started successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const endTrip = async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await tripModel.findOne({ matchCode });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (
      trip.rider.id.toString() !== req.user.id.toString() &&
      trip.driver?.id?.toString() !== req.user.id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the rider or driver can end the trip" });
    }

    const updatedTrip = await totaltripModel.findOneAndUpdate(
      { matchCode },
      { $set: { status: "trip completed" } },
      { new: true },
    );
    await tripModel.findOneAndDelete({ matchCode });

    const io = req.app.get("io");
    await broadCastTrip(io, "admins", "trip:completed", updatedTrip);
    const socket1 = getSocketsByUserId(trip.rider.id.toString());
    const socket2 = getSocketsByUserId(trip.driver?.id?.toString());
    io.to(socket1).emit("trip:completed", updatedTrip);
    io.to(socket2).emit("trip:completed", updatedTrip);

    return res.status(200).json({
      message: "Trip completed successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getTrip = async (req, res) => {
  const { matchCode } = req.params;

  try {
    const trip = await tripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip fetched successfully",
      data: trip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getActiveTrip = async (req, res) => {
  try {
    const all = await tripModel.find();
    res.status(200).json({ data: all });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTotalTrip = async (req, res) => {
  try {
    const all = await totaltripModel.find();
    res.status(200).json({ data: all });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const giveRating = async (req, res) => {
  const { driverId, rating } = req.body;
  if (!driverId || !rating) {
    return res
      .status(400)
      .json({ message: "Driver ID and Rating are Required" });
  }
  try {
    const find = await usermodel.findById(driverId);
    if (!find) {
      return res.status(400).json({ message: "Driver Not Found" });
    }
    if (+find.rating >= 1000) {
      return res.status(400).json({ message: "Driver Rating Is Already 100%" });
    }
    const update = await usermodel.findByIdAndUpdate(
      driverId,
      { $set: { rating: +find.rating + +rating } },
      { new: true },
    );
    const io = req.app.get("io");
    io.emit("rating-update", update);
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createTrip,
  assignTrip,
  applyTrip,
  acceptTrip,
  declineTrip,
  startTrip,
  endTrip,
  getTrip,
  getActiveTrip,
  getTotalTrip,
  giveRating,
};
