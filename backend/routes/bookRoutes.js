const express = require('express');
const router = express.Router();
const { 
    createBook, 
    getBooks, 
    getBookById, 
    updateBook, 
    deleteBook, 
    updateBookCover,
    uploadPdf
} = require('../controller/bookController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);

router.route('/').post(createBook).get(getBooks);
router.route('/upload-pdf').post(upload.single('pdf'), uploadPdf);
router.route('/:id').get(getBookById).put(updateBook).delete(deleteBook);
router.route('/cover/:id').put(upload.single('coverImage'), updateBookCover);

module.exports = router;