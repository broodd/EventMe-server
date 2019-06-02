const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    const card = await Card.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: req.position
          },
          spherical: true,
          distanceField: 'distance'
          // "maxDistance": 100000
        }
      },
      {
        $match: { _id: ObjectId(req.query.id) }
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
          location: '$location.coordinates'
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
