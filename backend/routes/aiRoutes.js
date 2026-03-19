const express = require('express');
const router = express.Router();
const { generateOutline, generateChapterContent, getWordDefinition, continueStory, speakText } = require('../controller/aiController');
const { protect, premiumOnly } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/generate-outline', premiumOnly, generateOutline);
router.post('/generate-chapter-content', premiumOnly, generateChapterContent);
router.post('/define', premiumOnly, getWordDefinition);
router.post('/continue', premiumOnly, continueStory);
router.post('/speak', premiumOnly, speakText);

module.exports = router;