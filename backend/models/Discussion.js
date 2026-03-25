const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    targetId: {
        type: String, // Can be Book ID or Manga Slug/ID
        required: true,
        index: true
    },
    targetType: {
        type: String,
        enum: ['book', 'manga'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

module.exports = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
