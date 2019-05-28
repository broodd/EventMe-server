const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    const user = new User({
      fbid: req.body.fbid,
      login: req.body.login,
      // name: req.body.name,
      img: req.body.img,
      bio: req.body.bio,
      cards: [],
      visit: []
    })
    await user.save()

    res.status(200).json({ id: user._id })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
