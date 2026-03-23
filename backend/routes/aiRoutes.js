const express = require('express');
const router = express.Router();
const { generateOutline, generateChapterContent, getWordDefinition, continueStory, speakText } = require('../controller/aiController');
const { protect, premiumOnly } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/generate-outline', premiumOnly, generateOutline);
router.post('/generate-chapter-content', premiumOnly, generateChapterContent);
router.post('/define', getWordDefinition);
router.post('/continue', continueStory);
router.post('/speak', speakText);

module.exports = router;