import React, {Component} from 'react'
import axios from 'axios'

export default class CategoryNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: {},
        }
    }

    async componentDidMount() {
        await axios.get('/api/cat-tree')
        .then(res => {
            const categories = res.data;
            this.setState({
                categories
            });
        });
    }

    render() {
        let parent = [];
        let mobileParent = [];
        for (let key in this.state.categories)
        {
            //Code for desktop screen
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

            //Code for mobile screen
            let keyTrim = key.replace(/ /g, '');

            const mobileChildrenDropdown = this.state.categories[key].children.map(child => {
                return (
                    <li><a href={'/category/' + child.path}>{child.name}</a></li>
                )
            });
            
            let mobileChilrenItem = (
                <ul id={'mobile-' + keyTrim}>
                    {mobileChildrenDropdown}
                </ul>
            )

            let mobileParentItem = (
                <li>
                    <div class="collapsible-header"><i class="material-icons left">keyboard_arrow_down</i>{key}</div>
                    <div class="collapsible-body">{mobileChilrenItem}</div>
                </li>
            )
            mobileParent.push(mobileParentItem);
        }

        const categoryNav = this.props.mobile ? (
            <div>
            <ul className="sidenav collapsible" id="mobile-categories">
                {mobileParent}
            </ul>
            
            </div>
        ) : (
            <li className='categories-nav'><a><i class="material-icons left">apps</i>Categories
                <div className="parent-categories-dropdown white">
                    {parent}
                </div></a>
            </li>
        )

        return (
            <div>
                {categoryNav}
            </div>
        )
    }
}