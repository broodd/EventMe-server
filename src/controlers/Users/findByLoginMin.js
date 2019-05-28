const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({ login: req.params.login }, {fbid: 1, login: 1})

    res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
