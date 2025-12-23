const express = require('express');
const router = express.Router();
const { generateOutline, generateChapterContent } = require('../controller/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/generate-outline', generateOutline);
router.post('/generate-chapter-content', generateChapterContent);

module.exports = router;