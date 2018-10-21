import React, {Component} from 'react'
import axios from 'axios'

export default class CategoryNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: {}
        }
    }

    async componentWillMount() {
        await axios.get('/api/cat-tree')
        .then(res => {
            const categories = res.data;
            this.setState({
                categories
            });
        });
        console.log(this.state);
    }

    render() {
        let parent = [];
        for (let key in this.state.categories)
        {
            let childrenDropdown = this.state.categories[key].children.map(child => {
                return (
                    <a className='teal-text' href={'/category/' + child.path}>{child.name}</a>
                )
            });
            let parentDropdown = (<a className='parent-category teal-text' href={'/category/' + this.state.categories[key].path}>
                    <i class="material-icons right">keyboard_arrow_right</i>{key}
                    <div className='children-categories-dropdown blue-grey lighten-5'>
                        {childrenDropdown}
                    </div>
                </a>
            )
            parent.push(parentDropdown);
        }
        return (
            <li className='categories-nav'><a><i class="material-icons left">apps</i>Categories
                <div className="parent-categories-dropdown white">
                    {parent}
                </div></a>
            </li>
        )
    }
}