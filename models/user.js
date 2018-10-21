const mongoose = require('mongoose');
const Course = require('./course');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: 'Student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    aboutMe: {
        type: String,
        default: ''
    },
    courses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
});

module.exports = mongoose.model('User', UserSchema);