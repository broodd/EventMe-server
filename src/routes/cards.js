const express = require('express')
const router = express.Router()

const Card = require('../models/card-model')
const User = require('../models/user-model')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


// function pagination (page_size, page_num) {
//   skips = page_size * (page_num - 1)
//   cursor = db['students'].find().skip(skips).limit(page_size)
// }

// var u1 = new User({
//   login: 'broodd',
//   name: 'Svyat',
//   img: 'Some img'
// });

// u1.save(function (err){
//  if(err) return console.error(err.stack)
//    console.log("User is added")
// });


// const c1 = new Card({
//   title: 'It work',
//   desc: 'some text',
//   user: "5ca7414fec99542644721a46",
//   time: 9,
//   like: 9,
//   visit: 9,
//   people: 9,
//   comments: 9,
//   create: -1232323,
//   img: []
// })

// c1.save(function (err){
//  if(err) return console.error(err.stack)
//    console.log("Card is added")
// });


// read all
// send cards
router.put('/cards', (req, res) => {
  var user_id = req.body.user_id,
      user_ps = req.body.position;
  Card.aggregate([
    {
      "$geoNear": {
        "near": {
          "type": "Point",
          "coordinates": user_ps
        },
        "distanceField": "distance",
        "spherical": true,
        // "maxDistance": 100000
      },
    },
    {
      $project: {
        "title": 1,
        "desc": 1,
        "img": 1,
        "people": 1,
        // "like": 1,
        // "visit": 1,
        "time": 1,
        "comments": 1,

        "user": "$user",
        temp: user_id,

        "like": {
          $size: "$likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(user_id), "$likeArr" ]
        },
        "visit": {
          $size: "$visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(user_id), "$visitArr" ]
        },

        "distance": "$distance"
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
        "user.fbid": 0,
        "user.cards": 0,
        "user.visit": 0,
        "user.bio": 0,
      }
    },
    {
      $unwind: '$user'
    },
  ])
  .exec((err, cards) => {
    if (err) {
      console.log(err);
      res.sendStatus(500)
    } else {
      res.send({ cards: cards })
    }
  })


  // var skip = req.params.skip || 0;
  // Card.find({}, {likeArr: 0, visitArr: 0})
  // .skip(skip)
  // // .limit(1)
  // .populate('user')
  // .sort({ _id: -1 })
  // .exec((err, cards) => {
  //   if (err) {
  //     res.sendStatus(500)
  //   } else {
  //     res.send({ cards: cards })
  //   }
  // })
})

router.get('/cards/geo', (req, res) => {
  Card.aggregate([
    { "$geoNear": {
      "near": {
        "type": "Point",
        "coordinates": [-73.98, 40.77]
      },
      "distanceField": "distance",
      "spherical": true,
      "maxDistance": 10000
    }}
  ])
  .exec((err, cards) => {
    if (err) {
      console.log(err);
      res.sendStatus(500)
    } else {
      res.send({ cards: cards })
    }
  })
})

// read one by id
// send card
router.put('/card/:id', (req, res) => {
  // Card.findOne({ _id: req.params.id }, { likeArr: 0, visitArr: 0 })
  // .populate({path: 'user', select: 'login name img'})
  // .exec((err, card) => {
  //   if (err) {
  //     res.sendStatus(500)
  //   } else {
  //     res.send({ card: card })
  //   }
  // })

  var user_id = req.body.user_id;
  Card.aggregate([
    {
      $match: { _id: ObjectId(req.params.id) }
    },
    {
      $project: {
        "title": 1,
        "desc": 1,
        "img": 1,
        "people": 1,
        // "like": 1,
        // "visit": 1,
        "time": 1,
        "comments": 1,

        "user": "$user",

        "like": {
          $size: "$likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(user_id), "$likeArr" ]
        },
        "visit": {
          $size: "$visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(user_id), "$visitArr" ]
        },
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
        "user.fbid": 0,
        "user.cards": 0,
        "user.visit": 0,
        "user.bio": 0,
      }
    },
    {
      $unwind: '$user'
    }
  ])
  .exec((err, card) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ card: card })
    }
  })
})

// read members card
// send card
router.put('/card/members/:id', (req, res) => {
  var pz = req.body.pz || 8;
  var pn = req.body.pn || 0;
  Card.aggregate([
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
        "_id": "$visitArr._id",
        "login": "$visitArr.login",
        "name": "$visitArr.name",
        "img": "$visitArr.img",
      }
    },
    {
      $skip: pn * pz
    },
    {
      $limit: pz
    },
  ])
  .exec((err, members) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else {
      res.send({ members: members })
    }
  })
})


// read comments card
// send card
router.put('/card/comments/:id', (req, res) => {
  var pz = req.body.pz || 10;
  var pn = req.body.pn || 0;
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

  Card.aggregate([
    // {
    //   $match: { _id: ObjectId(req.params.id) }
    // },
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
        "_id": "$commentsArr._id",
        "text": "$commentsArr.text",
        "create": "$commentsArr.create",

        "user": {
          "_id": { "$arrayElemAt": [ "$user._id", 0 ] },
          "login": { "$arrayElemAt": [ "$user.login", 0 ] },
          "name": { "$arrayElemAt": [ "$user.name", 0 ] },
          "img": { "$arrayElemAt": [ "$user.img", 0 ] },
        },
      }
    },
    { $unwind: '$user' },
    { $sort: { 'create': -1 } },
    {
      $skip: pn * pz
    },
    {
      $limit: pz
    },
  ])
  .exec((err, comments) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else {
      res.send({ comments: comments })
    }
  })
})

// create card
// send id
router.post('/card', (req, res) => {
  const card = new Card({
    title: req.body.title,
    desc: req.body.desc,
    user: req.body.user,
    time: req.body.time,
    people: req.body.people,
    comments: req.body.comments,
    create: req.body.create,
    img: req.body.img,
  })
  User.updateOne(
    { _id: req.body.user },
    { '$addToSet': { 'cards': card._id } },
    (err, data) => {
      if (err) {
        res.sendStatus(500)
      }
    }
  )
  card.save((err, data) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ id: data._id })
    }
  })
})

// push comment
router.put('/card/comment/:id', (req, res) => {
  const comm = {
    _id: new ObjectId(),
    user: req.body.user_id,
    text: req.body.text
  }
  Card.findByIdAndUpdate( req.params.id,
    {
      '$inc': { 'comments': 1 },
      '$push': {
        'commentsArr': comm
      }
    },
    (err, data) => {
      if (err) {
        res.sendStatus(500)
      } else {
        res.send({ id: comm._id })
      }
    }
  )
})

// update 
router.put('/card/:id', (req, res) => {
  Card.findById(req.params.id, (err, card) => {
    if (err) {
      console.log(err)
    } else {
      if (req.body.title) {
        card.title = req.body.title
      }
      if (req.body.desc) {
        card.desc = req.body.desc
      }
      if (req.body.time) {
        card.time = req.body.time
      }
      if (req.body.people) {
        card.people = req.body.people
      }
      if (req.body.comments) {
        card.comments = req.body.comments
      }
      if (req.body.img) {
        card.img = req.body.img
      }
      card.save(err => {
        if (err) {
          res.sendStatus(500)
        } else {
          res.sendStatus(200)
        }
      })
    }
  })
})

// update like/visit
// TODO maybe make this more pretty
router.put('/card/like_visit/:id', (req, res) => {
  if ( req.body.type === true ) {
    if ( req.body.has === true ) {
      Card.updateOne(
        { _id: req.params.id },
        { '$pull': { 'likeArr': req.body.user_id } },
        (err, data) => {
          if (err) {
            res.sendStatus(500)
          } else {
            res.sendStatus(200)
          }
        }
      )
    } 
    if ( req.body.has === false ) {
      Card.updateOne(
        { _id: req.params.id },
        { '$addToSet': { 'likeArr': req.body.user_id } },
        (err, data) => {
          if (err) {
            res.sendStatus(500)
          } else {
            res.sendStatus(200)
          }
        }
      )
    }
  }
  if ( req.body.type === false ) {
    if ( req.body.has === true ) {
      Card.updateOne(
        { _id: req.params.id },
        { '$pull': { 'visitArr': req.body.user_id } },
        (err, data) => {
          if (err) {
            throw err
          }
        }
      )
      User.updateOne(
        { _id: req.body.user_id },
        { '$pull': { 'visit': req.params.id } },
        (err, data) => {
          if (err) {
            res.sendStatus(500)
          } else {
            res.sendStatus(200)
          }
        }
      )
    }
    if ( req.body.has === false ) {
      Card.updateOne(
        { _id: req.params.id },
        { '$addToSet': { 'visitArr': req.body.user_id } },
        (err, data) => {
          if (err) {
            throw err
          }
        }
      )
      User.updateOne(
        { _id: req.body.user_id },
        { '$addToSet': { 'visit': req.params.id } },
        (err, data) => {
          if (err) {
            res.sendStatus(500)
          } else {
            res.sendStatus(200)
          }
        }
      )
    }  
  }
})

// delet by id
router.delete('/card/:id', (req, res) => {
  User.updateOne(
    { _id: req.body.user_id },
    { '$pukk': { 'cards': card._id } },
    (err, data) => {
      if (err) {
        res.sendStatus(500)
      }
    }
  )
  Card.remove({ _id: req.params.id }, err => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})

module.exports = router