const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    path: {
        type: String
    }},
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    }
);

//Populate the parent so I can reference it in the virtual path
CategorySchema.pre('find', function (next) {
    this.populate('parent');  // now available as this.parent in this schema
    next();
});

CategorySchema.pre('save', function (next) {
    if (!this.parent) 
        this.path = this.name.replace(/ /g, '-').toLowerCase();
    else 
        this.path = this.parent.path + '/' + this.name.replace(/ /g, '-').toLowerCase();
    next();
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;