const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    var pz = +req.query.pz || req.defVars.__membersSize;
    var pn = +req.query.pn || 0;

    const members = await  Card.aggregate([
      {
        $match: { _id: ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'visitArr',
          foreignField: '_id',
          as: 'visitArr'
        }
      },
      { $unwind: '$visitArr' },
      {
        $project: {
          _id: '$visitArr._id',
          login: '$visitArr.login',
          name: '$visitArr.name',
          img: '$visitArr.img'
        }
      },
      {
        $skip: pn * pz
      },
      {
        $limit: pz
      }
    ])

    res.status(200).json({ members });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
