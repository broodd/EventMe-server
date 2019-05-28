const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    var regex = new RegExp(req.query.text, "ig");

    const card = await Card.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: req.position
          },
          distanceField: 'distance',
          spherical: true
          // "maxDistance": 100000
        }
      },
      {
        $match: {
          $or: [
            {
              title: {
                $regex: regex
              }
            },
            {
              desc: {
                $regex: regex 
              }
            }
          ]
        }
      },
      {
        $project: {
          title: 1,
          desc: 1,
          img: 1,
          people: 1,
          time: 1,
          comments: 1,

          user: '$user',

          like: {
            $size: '$likeArr'
          },
          hasLike: {
            $in: [ObjectId(req.userId), '$likeArr']
          },
          visit: {
            $size: '$visitArr'
          },
          hasVisit: {
            $in: [ObjectId(req.userId), '$visitArr']
          },

          distance: '$distance',
          create: '$create'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          'user.fbid': 0,
          'user.cards': 0,
          'user.visit': 0,
          'user.bio': 0
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: {
          distance: 1,
          create: -1
        }
      }
    ]);

    res.status(200).json({ card });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
