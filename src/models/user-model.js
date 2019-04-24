const User = require('./card-model.js');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  fbid: {
    type: String,
    // unique: true,
    // index: true,
    default: null
  },
  login: {
    type: String,
    unique: true,
    default: undefined
  },
  // name: {
  //   type: String,
  //   default: undefined
  // },
  img: {
    type: String,
    default: undefined
  },
  bio: {
    type: String,
  },
  cards: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'card',
    default: undefined 
  }],
  visit:  [{ 
    type: Schema.Types.ObjectId, 
    ref: 'card',
    default: undefined 
  }],
})

module.exports = mongoose.model('user', UserSchema)