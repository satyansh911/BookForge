const express = require('express');
const router = express.Router();
const { 
    createBook, 
    getBooks, 
    getBookById, 
    updateBook, 
    deleteBook, 
    updateBookCover,
    uploadPdf,
    updateBookProgress,
    addAnnotation,
    deleteAnnotation,
    getRelatedBooks,
    getBookDeals
} = require('../controller/bookController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/').post(protect, createBook).get(protect, getBooks);
router.route('/upload-pdf').post(protect, upload.single('pdf'), uploadPdf);
router.route('/progress/:id').patch(protect, updateBookProgress);
router.route('/annotations/:id').post(protect, addAnnotation);
router.route('/annotations/:id/:annotationId').delete(protect, deleteAnnotation);
router.route('/related/:id').get(protect, getRelatedBooks);
router.route('/deals/:id').get(protect, getBookDeals);
router.route('/:id').get(protect, getBookById).put(protect, updateBook).delete(protect, deleteBook);
router.route('/cover/:id').put(protect, upload.single('coverImage'), updateBookCover);

module.exports = router;