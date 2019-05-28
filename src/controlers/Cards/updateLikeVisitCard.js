const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');
const User = require('../../models/user-model');

module.exports = async (req, res) => {
  try {
    // toggle like
    if (req.body.type === true) {
      if (req.body.has === true) {
        await Card.updateOne(
          { _id: req.params.id },
          { $pull: { likeArr: ObjectId(req.userId) } },
        );
          
        res.sendStatus(200);
      }
      if (req.body.has === false) {
        await Card.updateOne(
          { _id: req.params.id },
          { $addToSet: { likeArr: ObjectId(req.userId) } },
        );
          
        return res.sendStatus(200);
      }
    }

    // toggle visit
    else if (req.body.type === false) {
      if (req.body.has === true) {
        await Card.updateOne(
          { _id: req.params.id },
          { $pull: { visitArr: ObjectId(req.userId) } },
        );
        await User.updateOne(
          { _id: ObjectId(req.userId) },
          { $pull: { visit: req.params.id } },
        );
          
        res.sendStatus(200);
      }
      if (req.body.has === false) {
        await Card.updateOne(
          { _id: req.params.id },
          { $addToSet: { visitArr: ObjectId(req.userId) } },
        );
        await User.updateOne(
          { _id: ObjectId(req.userId) },
          { $addToSet: { visit: req.params.id } },
        );
          
        return res.sendStatus(200);
      }
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error toggle'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
