const express = require('express');
const router = express.Router();

const middleware = require('../controlers/middleware');
const fetchCards = require('../controlers/Cards/fetchCards');
const findById = require('../controlers/Cards/findById');
const findByText = require('../controlers/Cards/findByText');
const fetchMembers = require('../controlers/Cards/fetchMembers');
const fetchComments = require('../controlers/Cards/fetchComments');
const addNewCard = require('../controlers/Cards/addNewCard');
const addComment = require('../controlers/Cards/addComment');
const updateCard = require('../controlers/Cards/updateCard');
const updateLikeVisitCard = require('../controlers/Cards/updateLikeVisitCard');
const deleteCard = require('../controlers/Cards/deleteCard');

// fetchCards
router.get('/cards', middleware, fetchCards);

// findById
router.get('/card', middleware, findById);

// findById
router.get('/card_find', middleware, findByText);

// fetchMembers
router.get('/card/members/:id', middleware, fetchMembers);

// fetchComments
router.get('/card/comments/:id', middleware, fetchComments);

// addNewCard
// send id
router.post('/card', middleware, addNewCard);

// addComment
router.put('/card/comment/:id', middleware, addComment);

// updateCard
router.put('/card/update/:id', middleware, updateCard);

// updateLikeVisitCard
// TODO maybe make this more pretty
router.put('/card/like_visit/:id', middleware, updateLikeVisitCard);

// deleteCard
router.delete('/card/:id', middleware, deleteCard);

module.exports = router;
