const mongoose = require('mongoose');
const User = require('./user');
const Category = require('./category');

const CourseSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    image: {
        type: String
    },
    shortDescription: {
        type: String,
        default: 'This is a short text describes a summary purpose of this course.'
    },
    longDescription: {
        type: String,
        default: 'This is the long description section of a course.\n It is used to show the students a clear look about what the course offers, what the students will learn in the course.\nThings like target audience, money back garuantee...'
    },
    price: {
        type: Number,
        require: true
    },
    ratings: [
        {
            type: Number,
            min: 1,
            max: 5
        }
    ],
    dateCreated: {
        type: Date,
        default: new Date()
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    slug: {
        type: String
    },
});

module.exports = mongoose.model('Course', CourseSchema);