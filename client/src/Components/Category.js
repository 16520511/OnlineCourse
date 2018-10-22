import React, {Component} from 'react'
import CoursesIndex from './CoursesIndex'
import CategoryBreadcrumb from './CategoryBreadcrumb'

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            catPath: ''
        }
    }

    componentWillMount() {
        this.setState({
            catPath: this.props.location.pathname.split('/category/')[1]
        });
    }

    makeTextCapitalize = (text) => {
        let newText = text[0][0].toUpperCase() + text[0].slice(1);
        for(let i of text) {
            if (i != text[0])
                newText += " " + i[0].toUpperCase() + i.slice(1);
        }
        return newText;
    }

    render() {
        //All this code just for capitalize the name of the category @@
        let name = this.props.location.pathname.split('/');
        name = name[name.length-1].split('-');
        const catName = this.makeTextCapitalize(name);

        return (
            <div className='my-container'>
            <CategoryBreadcrumb path={this.props.location.pathname} />
            <h3 className='teal-text'>{catName}</h3>
                <CoursesIndex path={'/api/category/'} body= {this.state.catPath} />
            </div>
        )
    };
}

export default Category;