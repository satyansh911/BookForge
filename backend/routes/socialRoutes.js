const express = require('express');
const router = express.Router();
const { 
    getLeaderboard, 
    voteCharacter, 
    getDiscussions, 
    postDiscussion 
} = require('../controller/socialController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.post('/vote/:id', protect, voteCharacter);
router.get('/discuss/:targetId', getDiscussions);
router.post('/discuss', protect, postDiscussion);

module.exports = router;
