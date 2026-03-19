const express = require('express');
const router = express.Router();
const { generateOutline, generateChapterContent } = require('../controller/aiController');
const { protect, premiumOnly } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/generate-outline', premiumOnly, generateOutline);
router.post('/generate-chapter-content', premiumOnly, generateChapterContent);

module.exports = router;