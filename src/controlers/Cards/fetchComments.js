const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Card = require('../../models/card-model');

module.exports = async (req, res) => {
  try {
    var pz = +req.query.pz || req.defVars.__commentsSize;
    var pn = +req.query.pn || 0;
    // Card.findById(req.params.id,
    //   {
    //     _id: 1,
    //     commentsArr: { '$slice': [pn * pz, pz]  },
    //     // "commentsArr.reply": { '$slice': [0,1] }
    //   }
    // )
    // .populate({
    //   path: 'commentsArr.user',
    //   select: '_id login name img',
    // })
    // .exec((err, comments) => {
    //   if (err) {
    //     console.log(err);
    //     res.sendStatus(500)
    //   } else {
    //     res.send({ comments: comments.commentsArr })
    //   }
    // })

    const comments = await Card.aggregate([
      {
        $match: { _id: ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'commentsArr.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$commentsArr' },
      {
        $project: {
          _id: '$commentsArr._id',
          text: '$commentsArr.text',
          create: '$commentsArr.create',

          user: {
            _id: { $arrayElemAt: ['$user._id', 0] },
            login: { $arrayElemAt: ['$user.login', 0] },
            name: { $arrayElemAt: ['$user.name', 0] },
            img: { $arrayElemAt: ['$user.img', 0] }
          }
        }
      },
      { $unwind: '$user' },
      { $sort: { create: -1 } },
      { $skip: pn * pz },
      { $limit: pz }
    ])

    res.status(200).json({ comments })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
