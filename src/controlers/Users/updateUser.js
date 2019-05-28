const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    var user = await User.findById(req.userId)

    if (req.body.fbid) {
      user.fbid = req.body.fbid
    }
    if (req.body.login) {
      user.login = req.body.login
    }
    if (req.body.name) {
      user.name = req.body.name
    }
    if (req.body.img) {
      user.img = req.body.img
    }
    if (req.body.bio) {
      user.bio = req.body.bio
    }
    await user.save()

    res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
