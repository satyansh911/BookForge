const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
});

const annotationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['highlight', 'quote'],
        required: true,
    },
    chapterIndex: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        default: "",
    },
    color: {
        type: String,
        default: "rgba(173, 71, 51, 0.3)", // Default accent color with opacity
    }
}, { timestamps: true });

const bookSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String,
            default: "",
        },
        author:{
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            default: "",
        },
        chapters: [chapterSchema],
        annotations: [annotationSchema],
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
        lastChapterIndex: {
            type: Number,
            default: 0
        },
        lastPageIndex: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);