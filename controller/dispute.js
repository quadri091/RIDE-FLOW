const disputeModel = require("../model/dispute-model.js");
const usermodel = require("../model/form-model.js");
const totaltripModel = require("../model/totaltrip-model.js");
const { uploadImage } = require("../utils/uploader.js");
const { getSocketsByUserId } = require("../socket.js");
const broadCastDispute = async (room, io, request) => {
  io.to("admins").emit(room, request);
};
// RIDER or DRIVER creates a dispute
const createDispute = async (req, res) => {
  const { matchCode, reason, description } = req.body;

  if (!matchCode || !reason || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // find the trip
    const trip = await totaltripModel.findOne({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.status !== "trip completed") {
      return res
        .status(400)
        .json({ message: "Can only dispute completed trips" });
    }

    const existingDispute = await disputeModel.findOne({
      "trip.matchCode": matchCode,
    });
    if (existingDispute) {
      return res.status(409).json({
        message: "A dispute already exists for this trip",
        data: existingDispute,
      });
    }

    // auto detect if logged in user is rider or driver
    const isRider = trip.rider.id.toString() === req.user.id.toString();
    const isDriver = trip.driver.id.toString() === req.user.id.toString();

    if (!isRider && !isDriver) {
      return res.status(403).json({ message: "You are not part of this trip" });
    }

    const raisedBy = isRider
      ? {
          id: trip.rider.id,
          name: trip.rider.name,
          number: trip.rider.number,
          role: "rider",
        }
      : {
          id: trip.driver.id,
          name: trip.driver.name,
          number: trip.driver.number,
          role: "driver",
        };

    const against = isRider
      ? {
          id: trip.driver.id,
          name: trip.driver.name,
          number: trip.driver.number,
          role: "driver",
        }
      : {
          id: trip.rider.id,
          name: trip.rider.name,
          number: trip.rider.number,
          role: "rider",
        };

    const dispute = await disputeModel.create({
      trip: {
        id: trip.id,
        matchCode: trip.matchCode,
        price: trip.price,
        startLocation: {
          coordinates: trip.startLocation.coordinates,
          address: trip.startLocation.address,
        },
        endLocation: {
          coordinates: trip.endLocation.coordinates,
          address: trip.endLocation.address,
        },
      },
      raisedBy,
      against,
      reason,
      description,
    });

    const io = req.app.get("io");
    await broadCastDispute("dispute:created", io, dispute);
    const socket1 = getSocketsByUserId(trip.rider.id.toString());
    const socket2 = getSocketsByUserId(trip.driver.id.toString());
    io.to(socket1).emit("dispute:created", dispute);
    io.to(socket2).emit("dispute:created", dispute);

    return res.status(201).json({
      message: "Dispute created successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ADMIN — get all disputes
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await disputeModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Disputes fetched successfully",
      data: disputes,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get single dispute by matchCode
const getDisputeByCode = async (req, res) => {
  const { matchCode } = req.params;

  try {
    const dispute = await disputeModel.findOne({ "trip.matchCode": matchCode });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    return res.status(200).json({
      message: "Dispute fetched successfully",
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// OPS MANAGER — update status (Open → Under Review → Escalated)
const updateDisputeStatus = async (req, res) => {
  const { matchCode } = req.params;
  const { status, note } = req.body;

  if (!status || !note) {
    return res.status(400).json({ message: "Status and note are required" });
  }

  // admin cannot set Resolved — only super_admin can
  if (
    req.user.role === "admin" &&
    status.toString().toLowerCase() === "resolved"
  ) {
    return res
      .status(403)
      .json({ message: "Only Super Admin can resolve disputes" });
  }

  try {
    const dispute = await disputeModel.findOne({ "trip.matchCode": matchCode });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = status;
    dispute.resolution.note = note;
    dispute.resolution.resolvedBy = req.user.id;
    dispute.resolution.resolvedAt = new Date();

    await dispute.save();
    const io = req.app.get("io");
    const socket1 = getSocketsByUserId(dispute.raisedBy.id.toString());
    const socket2 = getSocketsByUserId(dispute.against.id.toString());
    io.to(socket1).emit("dispute:updated", dispute);
    io.to(socket2).emit("dispute:updated", dispute);
    await broadCastDispute("dispute:updated", req.app.get("io"), dispute);

    return res.status(200).json({
      message: "Dispute updated successfully",
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const addEvidence = async (req, res) => {
  const { image } = req.body;
  const { matchCode } = req.params;
  if (!image?.trim() || !matchCode?.trim()) {
    return res
      .status(400)
      .json({ message: "Image and Match Code are required" });
  }

  try {
    const user = req.user;
    const dispute = await disputeModel.findOne({ "trip.matchCode": matchCode });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }
    const file = await uploadImage(image);
    dispute.evidence.push({
      imageUrl: file,
      sender: {
        id: user.id,
        name: user.userName,
        role: user.role,
      },
    });
    await dispute.save();

    const io = req.app.get("io");
    const socket1 = getSocketsByUserId(dispute.raisedBy.id.toString());
    const socket2 = getSocketsByUserId(dispute.against.id.toString());
    io.to(socket1).emit("dispute:updated", dispute);
    io.to(socket2).emit("dispute:updated", dispute);
    await broadCastDispute("dispute:updated", req.app.get("io"), dispute);
    return res.status(200).json({
      message: "Evidence added successfully",
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// OPS MANAGER — escalate to super admin
const escalateDispute = async (req, res) => {
  const { matchCode } = req.params;
  const { note } = req.body;

  try {
    const dispute = await disputeModel.findOne({ "trip.matchCode": matchCode });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    if (
      dispute.status.toLowerCase() === "resolved" ||
      dispute.status.toLowerCase() === "rejected"
    ) {
      return res
        .status(400)
        .json({ message: "Cannot escalate a closed dispute" });
    }

    dispute.status = "Escalated";
    dispute.resolution.note = note || "Escalated to Super Admin for review";
    dispute.resolution.resolvedBy = req.user.id;
    dispute.resolution.resolvedAt = new Date();

    await dispute.save();

    const io = req.app.get("io");
    const socket1 = getSocketsByUserId(dispute.raisedBy.id.toString());
    const socket2 = getSocketsByUserId(dispute.against.id.toString());
    io.to(socket1).emit("dispute:escalated", dispute);
    io.to(socket2).emit("dispute:escalated", dispute);
    await broadCastDispute("dispute:escalated", req.app.get("io"), dispute);

    return res.status(200).json({
      message: "Dispute escalated to Super Admin",
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// SUPER ADMIN — final resolution
const resolveDispute = async (req, res) => {
  const { matchCode } = req.params;
  const { status, note } = req.body;

  if (!status || !note) {
    return res.status(400).json({ message: "Status and note are required" });
  }

  if (!["resolved", "rejected"].includes(status.toLowerCase())) {
    return res
      .status(400)
      .json({ message: "Super Admin can only Resolve or Reject" });
  }

  try {
    const dispute = await disputeModel.findOne({ "trip.matchCode": matchCode });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = status;
    dispute.resolution.note = note;
    dispute.resolution.resolvedBy = req.user.id;
    dispute.resolution.resolvedAt = new Date();

    await dispute.save();
    const io = req.app.get("io");
    const socket1 = getSocketsByUserId(dispute.raisedBy.id.toString());
    const socket2 = getSocketsByUserId(dispute.against.id.toString());
    io.to(socket1).emit("dispute:resolved", dispute);
    io.to(socket2).emit("dispute:resolved", dispute);
    await broadCastDispute("dispute:resolved", req.app.get("io"), dispute);

    return res.status(200).json({
      message: `Dispute ${status.toLowerCase()} successfully`,
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ADMIN — delete dispute
const deleteDispute = async (req, res) => {
  const { matchCode } = req.params;

  try {
    const dispute = await disputeModel.findOneAndDelete({
      "trip.matchCode": matchCode,
    });
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }
    const io = req.app.get("io");
    const socket1 = getSocketsByUserId(dispute.raisedBy.id.toString());
    const socket2 = getSocketsByUserId(dispute.against.id.toString());
    io.to(socket1).emit("dispute:deleted", dispute);
    io.to(socket2).emit("dispute:deleted", dispute);
    await broadCastDispute("dispute:deleted", req.app.get("io"), dispute);
    return res.status(200).json({
      message: "Dispute deleted successfully",
      data: dispute,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createDispute,
  getAllDisputes,
  getDisputeByCode,
  updateDisputeStatus,
  escalateDispute,
  resolveDispute,
  deleteDispute,
  addEvidence,
};
