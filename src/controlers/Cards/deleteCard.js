const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');
const User = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.UserId },
      { $pull: { cards: req.params._id } },
    );
    await Card.remove({ _id: req.params.id });

    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
