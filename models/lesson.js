const mongoose = require('mongoose');
const Course = require('./course')

const LessonSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    number: {
        type: Number,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    youtubeVid: String,
    file: String,
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    preview: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String
    }
});

module.exports = mongoose.model('Lesson', LessonSchema);