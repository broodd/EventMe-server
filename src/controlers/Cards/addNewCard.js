const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    const card = await new Card({
      title: req.body.title,
      desc: req.body.desc,
      user: req.userId,
      time: req.body.time,
      people: req.body.people,
      'location.coordinates': req.body.location
    });

    User.updateOne(
      { _id: req.userId },
      { $addToSet: { cards: card._id } }
    );

    await card.save();

    res.status(200).json({ id: card._id })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
