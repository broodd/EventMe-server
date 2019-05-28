const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({ fbid: req.params.id }, {fbid: 1, login: 1, name: 1, img: 1, bio: 1})

    if (user)
      res.status(200).json({ user })
    else
      res.status(500).json({
        success: false,
        message: 'User not found'
      })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
