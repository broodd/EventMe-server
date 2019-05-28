const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }, {login: 1, name: 1, img: 1, bio: 1, cards: 1})

    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
