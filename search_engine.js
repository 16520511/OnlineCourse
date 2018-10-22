const Course = require('./models/course')
const mongoose = require('mongoose');

async function SimpleSearch(keyword) {
    const splitKeyword = keyword.indexOf(' ') === -1 ? [keyword.toLowerCase()] : keyword.toLowerCase().split(' ');
    let result = [];
    await Course.find({}).populate('instructor').exec()
    .then(courses => {
        for (let i = 0; i < courses.length; i++)
        {
            let keywordRelevant = 0;
            for (let j = 0; j < splitKeyword.length; j++)
            {
                if (courses[i].title.toLowerCase().indexOf(splitKeyword[j]) != -1)
                {
                    keywordRelevant += 1;
                }
            }
            let courseClone = JSON.parse(JSON.stringify(courses[i]));
            if (keywordRelevant > 0)
            {
                courseClone['relevant'] = keywordRelevant;
                result.push(courseClone);
            }
        }
    }).catch(err => err);
    return result;
}

module.exports.SimpleSearch = SimpleSearch;