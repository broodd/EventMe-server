const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    var filter = JSON.parse(req.query.filter)

    var pageNum = +req.query.pageNum || 0;
    var regex = new RegExp(filter.text || '', "ig");
    var max = (+filter.max * 1000) || req.defVars.__max;
    var min = (+filter.min * 1000) || 0;


    var sort = {}
    sort.create = -1
    if (filter.orderTime !== undefined)
      sort.time = filter.orderTime
    
    if (filter.orderDis !== undefined)
      sort.distance = filter.orderDis



    console.log(req.userId, req.position, filter, max, min, regex, pageNum, sort)

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
        $sort: sort
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
