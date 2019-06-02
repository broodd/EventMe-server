const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    var regex = new RegExp(req.query.text, "ig");
    const pageNum = req.query.pageNum || 0;
    const max     = (+req.query.max * 1000) || req.defVars.__max;
    const min     = (+req.query.min * 1000) || 0;

    const cards = await Card.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: req.position
          },
          spherical: true,
          maxDistance: max,
          minDistance: min,
          distanceField: 'distance'
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
          create: -1,
          distance: 1,
          time: -1,
        }
      },
      {
        $skip: pageNum * req.defVars.__pageSize
      },
      {
        $limit: req.defVars.__pageSize
      }
    ]);

    res.status(200).json({ cards });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
