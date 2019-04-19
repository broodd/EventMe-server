const User = require('./user-model.js');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CardSchema = new Schema({
  title: {
    type: String,
  },
  desc: {
    type: String
  },
  user: {
    // type: String
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  time: {
    type: Number
    // type: Date, 
    // default: Date.now
  },
  people: {
    type: Number
  },
  comments: {
    type: Number,
    default: 0
  },
  create: {
    type: Date, 
    default: Date.now
  },
  img: {
    type: [String],
    default: undefined
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [45.5, -73.5]
    }
  },
  likeArr: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: undefined
  }],
  visitArr: [{ 
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: undefined
  }],
  commentsArr: [{
    _id: Schema.Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      default: undefined
    },
    text: String,
    create: {
      type: Date, 
      default: Date.now
    },
    // reply: [{
    //   _id: Schema.Types.ObjectId,
    //   user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'user',
    //     default: undefined
    //   },
    //   text: String,
    //   create: {
    //     type: Date, 
    //     default: Date.now
    //   },
    // }]
  }]
})


CardSchema.index({location: '2dsphere'});

module.exports = mongoose.model('card', CardSchema)