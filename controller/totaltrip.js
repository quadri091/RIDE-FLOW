const totaltripModel = require("../model/totaltrip-model");
const broadCastTrip = async (io, room, path, data) => {
  io.to(room).emit(path, data);
};
const deleteTrip = async (req, res) => {
  const { matchCode } = req.params;
  if (!matchCode) {
    return res.status(400).json({ message: "Match code is required" });
  }

  try {
    const trip = await totaltripModel.findOneAndDelete({ matchCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await broadCastTrip(req.app.get("io"), "admins", "trip:deleted", trip);

    return res.status(200).json({
      message: "Trip deleted successfully",
      data: trip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const trips = await totaltripModel.find();
    return res.status(200).json({
      message: "Trips fetched successfully",
      data: trips,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { deleteTrip, getAll };
