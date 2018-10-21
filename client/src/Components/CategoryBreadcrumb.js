import React, {Component} from 'react'
import CoursesIndex from './CoursesIndex'

export default class CategoryBreadcrumb extends Component {
    makeTextCapitalize = (text) => {
        let newText = text[0][0].toUpperCase() + text[0].slice(1);
        for(let i of text) {
            if (i != text[0])
                newText += " " + i[0].toUpperCase() + i.slice(1);
        }
        return newText;
    }
    
    render() {
        let eachCategory = this.props.path.split('/category').slice(1,)[0];
        eachCategory = eachCategory.split('/').slice(1,);
        let pathArrays = [];
        for (let i = 0; i < eachCategory.length; i++)
        {
            let pathElement = '';
            for (let j = 0; j <= i; j++)
                pathElement += '/' + eachCategory[j];
            let pathCatName = this.makeTextCapitalize(eachCategory[i].split('-'));
            pathArrays.push({name: pathCatName, path: pathElement});
        }
        const breadcrumbLinks = pathArrays.map(path => {
            return <a href={'/category' + path.path} className="breadcrumb teal-text">{path.name}</a>
        });

        return (
            <div className='breadcrumb-nav'>
                {breadcrumbLinks}
            </div>
        )
    }
}