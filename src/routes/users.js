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


const middleware = require('../controlers/middleware');
const findByFbId = require('../controlers/Users/findByFbId');
const findById = require('../controlers/Users/findById');
const findByLoginMin = require('../controlers/Users/findByLoginMin');
const userCards = require('../controlers/Users/userCards');
const visitCards = require('../controlers/Users/visitCards');
const addNewUser = require('../controlers/Users/addNewUser');
const updateUser = require('../controlers/Users/updateUser');
const deleteUser = require('../controlers/Users/deleteUser');


// findByFbId [It some secret, call only when login and reg user]
// send user witout refs {cards, visit}
router.get('/user/fb/:id', findByFbId)

// findById
// send user witout refs {cards, visit}
router.get('/user/:id', middleware, findById)

// findByLoginMin
// send user {fbid, login} 
router.get('/user/min/login/:login', middleware, findByLoginMin)

// userCards
// some minus, beacause find all cards where author is user_id
router.get('/user/cards/beta', middleware, userCards)

// visitCards
// send user {fbid, login} 
router.get('/user/visit/beta', middleware, visitCards)

// addNewUser
// send id
router.post('/user', middleware, addNewUser)

// updateUser
router.put('/user', middleware, updateUser)

// deleteUser
router.delete('/user', middleware, deleteUser)

module.exports = router