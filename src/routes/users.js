const express = require('express')
const router = express.Router()

const Card = require('../models/card-model')
const User = require('../models/user-model')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

// default variables
var __pageSize    = 5,
    __position    = [0, 0],
    __membersSize = 8,
    __commentsSize = 10;

// findByFbId [It some secret, call only when login and reg user]
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

// findById
// send user witout refs {cards, visit}
router.get('/user/:id', (req, res) => {
  User.findOne({ _id: req.params.id }, {login: 1, name: 1, img: 1, bio: 1, cards: 1})
  // .populate('cards', 'visit')
  .exec((err, user) => {
    if (err) {
      res.sendStatus(500)
    } else {
      res.send({ user: user })
    }
  })
})

// findByLoginMin
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

// userCards
router.get('/user/cards/beta/:id', (req, res) => {
  var userId = req.params.id,
      position = req.query.position || __position
      pageNum    = req.query.pageNum || 0;

  position[0] = +position[0]
  position[1] = +position[1]
      // limit   = req.body.limit || 10;
  Card.aggregate([
    {
      "$geoNear": {
        "near": {
          "type": "Point",
          "coordinates": position
        },
        "distanceField": "distance",
        "spherical": true,
        // "maxDistance": 100000
      },
    },
    {
      $match: { user: ObjectId(req.params.id) }
    },
    {
      $project: {
        "title": 1,
        "desc": 1,
        "img": 1,
        "people": 1,
        "time": 1,
        "comments": 1,

        "user": "$user",
        temp: userId,

        "like": {
          $size: "$likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(userId), "$likeArr" ]
        },
        "visit": {
          $size: "$visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(userId), "$visitArr" ]
        },

        "distance": "$distance",
        "create": "$create"
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
    {
      $sort: {
        distance: 1,
        create:  -1
      }
    },
    {
      $skip: pageNum * __pageSize
    },
    {
      $limit: __pageSize
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
router.get('/user/cards/:id', (req, res) => {
  var user_id = req.params.id,
      user_ps = req.query.position || [0, 0],
      pn    = req.query.pn || 0;

  user_ps[0] = +user_ps[0]
  user_ps[1] = +user_ps[1]
      // limit   = req.body.limit || 10;
  User.aggregate([
    {
      $match: { _id: ObjectId(user_id) }
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

        "disance": "$distance"
      }
    },
    {
      $sort: { create: -1 }
    },
    {
      $skip: pn * pzDef
    },
    {
      $limit: pzDef
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
router.get('/user/visit/beta/:id', (req, res) => {
  var userId = req.params.id,
      position = req.query.position || __position,
      pageNum    = req.query.pageNum || 0;

  position[0] = +position[0]
  position[1] = +position[1]
      // limit   = req.body.limit || 10;
  Card.aggregate([
    {
      "$geoNear": {
        "near": {
          "type": "Point",
          "coordinates": position
        },
        "distanceField": "distance",
        "spherical": true,
        // "maxDistance": 100000
      },
    },
    {
      $match: { 
        "$in": [ ObjectId(userId), "$visitArr" ]
      }
    },
    {
      $project: {
        "title": 1,
        "desc": 1,
        "img": 1,
        "people": 1,
        "time": 1,
        "comments": 1,

        "user": "$user",

        "like": {
          $size: "$likeArr"
        },
        "hasLike" : {
          $in: [ ObjectId(userId), "$likeArr" ]
        },
        "visit": {
          $size: "$visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(userId), "$visitArr" ]
        },

        "distance": "$distance",
        "create": "$create"
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
    {
      $sort: {
        distance: 1,
        create:  -1
      }
    },
    {
      $skip: pageNum * __pageSize
    },
    {
      $limit: __pageSize
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
router.get('/user/visit/:id', (req, res) => {
  var userId = req.params.id,
      position = req.query.position || __position,
      pageNum    = req.query.pageNum || 0;

  position[0] = +position[0]
  position[1] = +position[1]

  console.log(userId);

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
        "hasLike": {
          $in: [ ObjectId(userId), "$visit.likeArr" ]
        },
        "visit": {
          $size: "$visit.visitArr"
        },
        // "hasVisit": "true"
        "hasVisit" : {
          $in: [ ObjectId(userId), "$visit.visitArr" ]
        },

        "create": "$visit.create"
      }
    },
    {
      $sort: { time: 1 }
    },
    {
      $skip: pageNum * __pageSize
    },
    {
      $limit: __pageSize
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