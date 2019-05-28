const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    if (req.body.text) {
      const comm = {
        _id: new ObjectId(),
        user: req.userId,
        text: req.body.text
      };
      const data = await Card.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { comments: 1 },
          $push: {
            commentsArr: comm
          }
        }
      );
      
      res.json({ id: data._id });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Text is empty'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
