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



// fetchCards
router.get('/cards', (req, res) => {
  var userId = req.query.userId,
      position = req.query.position || __position,
      pageNum    = req.query.pageNum || 0;

  console.log(pageNum, req.body.pageNum);

  position[0] = +position[0]
  position[1] = +position[1]
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
        create:  -1,
        // time: 1
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
      console.log(err);
      res.sendStatus(500)
    } else {
      res.send({ cards: cards })
    }
  })
})

// findById
router.get('/card/:id', (req, res) => {
  var userId = req.query.userId,
      position = req.query.position || __position;

  position[0] = +position[0]
  position[1] = +position[1]

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
          $in: [ ObjectId(userId), "$likeArr" ]
        },
        "visit": {
          $size: "$visitArr"
        },
        "hasVisit" : {
          $in: [ ObjectId(userId), "$visitArr" ]
        },
        "location": "$location.coordinates"
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

// fetchMembers
// send card
router.get('/card/members/:id', (req, res) => {
  var pz = +req.query.pz || __membersSize;
  var pn = +req.query.pn || 0;
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


// fetchComments
// send card
router.get('/card/comments/:id', (req, res) => {
  var pz = +req.query.pz || __commentsSize;
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

  Card.aggregate([
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

// addNewCard
// send id
router.post('/card', (req, res) => {
  const card = new Card({
    title: req.body.title,
    desc: req.body.desc,
    user: req.body.user,
    time: req.body.time,
    people: req.body.people,
    "location.coordinates" : req.body.location
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

// addComment
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
        res.send({ id: data._id })
      }
    }
  )
})

// updateCard
router.put('/card/update/:id', (req, res) => {
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
      if (req.body.location) {
        card.location.coordinates = req.body.location
      }
      card.save(err => {
        if (err) {
          console.log(err);
          res.sendStatus(500)
        } else {
          res.sendStatus(200)
        }
      })
    }
  })
})

// updateLikeVisitCard
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

// deleteCard
router.delete('/card/:id', (req, res) => {
  User.updateOne(
    { _id: req.body.user_id },
    { '$pull': { 'cards': req.params._id } },
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