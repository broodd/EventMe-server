const express = require('express')
const router = express.Router()

const Card = require('../models/card-model')
const User = require('../models/user-model')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

// var u1 = new User({
//   fbid: "yTecEoEXjtV41av7HkZInRuCVk92",
//   login: 'some',
//   name: 'Svyat',
//   img: 'Some img',
//   bio: '',
//   cards: [],
//   visit: []
// });

// u1.save(function (err){
//  if(err) return console.error(err.stack)
//    console.log("User is added")
// });


// read one by fbid [It some secret, call only when login and reg user]
// send user witout refs {cards, visit}
router.get('/user/fb/:id', (req, res) => {
  User.findOne({ fbid: req.params.id }, {fbid: 1, login: 1, name: 1, img: 1, bio: 1})
  // .populate('cards', 'visit')
  .exec((err, user) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ user: user })
    }
  })
})

// read one by id [It some open and public key]
// send user witout refs {cards, visit}
router.get('/user/:id', (req, res) => {
  User.findOne({ _id: req.params.id }, {login: 1, name: 1, img: 1, bio: 1})
  // .populate('cards', 'visit')
  .exec((err, user) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ user: user })
    }
  })
})

// read one by login
// send user {fbid, login} 
router.get('/user/min/login/:login', (req, res) => {
  User.findOne({ login: req.params.login }, {fbid: 1, login: 1})
  .exec((err, user) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ user: user })
    }
  })
})

// read cards by id
// send user {fbid, login} 
router.put('/user/cards/:id', (req, res) => {
  // User.find({ _id: req.params.id }, {cards: 1})
  // .populate({ path: 'cards', options: { sort: {'_id': -1 } } })
  // .exec((err, cards) => {
  //   if (err) {
  //     res.sendStatus(500)
  //   } else {
  //     res.send({ cards: cards })
  //   }
  // })

  var user_id = req.body.user_id;
  User.aggregate([
    {
      $match: { _id: ObjectId(req.params.id) }
    },
    {
      $lookup: {
        from: 'cards',
        localField: 'cards',
        foreignField: '_id',
        as: 'cards'
      }
    },
    { $unwind: '$cards' },
    {
      $lookup: {
        from: 'users',
        localField: 'cards.user',
        foreignField: '_id',
        as: 'cards.user'
      }
    },
    {
      $project: {
        "_id": "$cards._id",
        "title": "$cards.title",
        "desc": "$cards.desc",
        "img": "$cards.img",
        "people": "$cards.people",
        "time": "$cards.time",
        "comments": "$cards.comments",
        "create": "$cards.create",

        "user": {
          "_id": { "$arrayElemAt": [ "$cards.user._id", 0 ] },
          "login": { "$arrayElemAt": [ "$cards.user.login", 0 ] },
          "name": { "$arrayElemAt": [ "$cards.user.name", 0 ] },
          "img": { "$arrayElemAt": [ "$cards.user.img", 0 ] },
        },

        "like": {
          $size: "$cards.likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(user_id), "$cards.likeArr" ]
        },
        "visit": {
          $size: "$cards.visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(user_id), "$cards.visitArr" ]
        },
      }
    },
    {
      $sort: { create: -1 }
    }
  ])
  .exec((err, cards) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else {
      res.send({ cards: cards })
    }
  })
})

// read cards by id
// send user {fbid, login} 
router.put('/user/visit/:id', (req, res) => {
  // User.find({ _id: req.params.id }, {visit: 1})
  // .populate({ path: 'visit', options: { sort: {'_id': -1 } } })
  // .exec((err, cards) => {
  //   if (err) {
  //     res.sendStatus(500)
  //   } else {
  //     res.send({ cards: cards })
  //   }
  // })

  var user_id = req.body.user_id;
  User.aggregate([
    {
      $match: { _id: ObjectId(req.params.id) }
    },
    {
      $lookup: {
        from: 'cards',
        localField: 'visit',
        foreignField: '_id',
        as: 'visit'
      }
    },
    { $unwind: '$visit' },
    // { $unwind: '$visit.user' },
    {
      $lookup: {
        from: 'users',
        localField: 'visit.user',
        foreignField: '_id',
        as: 'visit.user'
      }
    },
    {
      $project: {
        "_id": "$visit._id",
        "title": "$visit.title",
        "desc": "$visit.desc",
        "img": "$visit.img",
        "people": "$visit.people",
        "time": "$visit.time",
        "comments": "$visit.comments",

        "user": {
          "_id": { "$arrayElemAt": [ "$visit.user._id", 0 ] },
          "login": { "$arrayElemAt": [ "$visit.user.login", 0 ] },
          "name": { "$arrayElemAt": [ "$visit.user.name", 0 ] },
          "img": { "$arrayElemAt": [ "$visit.user.img", 0 ] },
        },

        "like": {
          $size: "$visit.likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(user_id), "$visit.likeArr" ]
        },
        "visit": {
          $size: "$visit.visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(user_id), "$visit.visitArr" ]
        },
      }
    }
  ])
  .exec((err, cards) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else {
      res.send({ cards: cards })
    }
  })
})

// create user
// send id
router.post('/user', (req, res) => {
  const user = new User({
    fbid: req.body.fbid,
    login: req.body.login,
    // name: req.body.name,
    img: req.body.img,
    bio: req.body.bio,
    cards: [],
    visit: []
  })
  user.save((err, data) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else {
      res.send({ id: data._id })
    }
  })
})

// update user
router.put('/user/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      console.log(err)
    } else {
      if (req.body.fbid) {
        user.fbid = req.body.fbid
      }
      if (req.body.login) {
        user.login = req.body.login
      }
      if (req.body.name) {
        user.name = req.body.name
      }
      if (req.body.img) {
        user.img = req.body.img
      }
      if (req.body.bio) {
        user.bio = req.body.bio
      }
      // if (req.body.visit) {
      //   user.visit = req.body.visit
      // }
      user.save(err => {
        if (err) {
          res.sendStatus(500)
        } else {
          res.sendStatus(200)
        }
      })
    }
  })
})

router.delete('/user/:id', (req, res) => {
  Card.remove({ fbid: req.params.id }, err => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})

module.exports = router