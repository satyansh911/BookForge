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
    addBookmark,
    deleteBookmark,
    getRelatedBooks,
    getBookDeals
} = require('../controller/bookController');
const { ingestFromUrl } = require('../controller/ingestController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/').post(protect, createBook).get(protect, getBooks);
router.route('/upload-pdf').post(protect, upload.single('pdf'), uploadPdf);
router.route('/progress/:id').patch(protect, updateBookProgress);
router.route('/annotations/:id').post(protect, addAnnotation);
router.route('/annotations/:id/:annotationId').delete(protect, deleteAnnotation);
router.route('/related/:id').get(protect, getRelatedBooks);
router.route('/bookmarks/:id').post(protect, addBookmark);
router.route('/bookmarks/:id/:bookmarkId').delete(protect, deleteBookmark);
router.route('/deals/:id').get(protect, getBookDeals);
router.route('/:id').get(protect, getBookById).put(protect, updateBook).delete(protect, deleteBook);
router.route('/cover/:id').put(protect, upload.single('coverImage'), updateBookCover);
router.post('/ingest-url', protect, ingestFromUrl);

module.exports = router;