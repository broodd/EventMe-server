const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)

    if (req.body.title) {
      card.title = req.body.title;
    }
    if (req.body.desc) {
      card.desc = req.body.desc;
    }
    if (req.body.time) {
      card.time = req.body.time;
    }
    if (req.body.people) {
      card.people = req.body.people;
    }
    if (req.body.comments) {
      card.comments = req.body.comments;
    }
    if (req.body.img) {
      card.img = req.body.img;
    }
    if (req.body.location) {
      card.location.coordinates = req.body.location;
    }
    
    await card.save();

    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
