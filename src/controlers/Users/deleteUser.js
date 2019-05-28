const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    await User.remove({ _id: req.userId })

    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
