const Course = require('./models/course')
const mongoose = require('mongoose');

async function SimpleSearch(keyword) {
    const splitKeyword = keyword.indexOf(' ') === -1 ? [keyword.toLowerCase()] : keyword.toLowerCase().split(' ');
    let result = [];

    await Course.find({}).populate('instructor').exec()
    .then(async (courses) => {
        console.log(splitKeyword);
        courses.forEach(course => {
            console.log(course.title);
            
            let keywordRelevant = 0;
            for (let j = 0; j < splitKeyword.length; j++)
                if (course.title.toLowerCase().indexOf(splitKeyword[j]) != -1)
                    keywordRelevant += 1;

            let courseClone = JSON.parse(JSON.stringify(course));
            if (keywordRelevant > 0)
            {
                courseClone['relevant'] = keywordRelevant;
                result.push(courseClone);
            }
        })
    }).catch(err => console.log(err));
    console.log('Hi');
    return result;
}

module.exports.SimpleSearch = SimpleSearch;