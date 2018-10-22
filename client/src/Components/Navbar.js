import React, {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import Login from './Login'
import axios from 'axios'
import CategoryNav from './CategoryNav'

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userLoggedIn: false,
            firstName: ''
        }
    }
    //Initial state of the navbar hello message
    componentDidMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        axios.post('/api/checkAuth', {username: username}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.data.message === 'hey you made it')
                this.setState({
                    userLoggedIn: true,
                    firstName: res.data.firstName
                });
        });
    }
    //If user logged in, show hello message on the navbar, if logged out, hide it
    userLoggedIn = (bool, firstName) => {
        this.setState({
            userLoggedIn: bool,
            firstName: firstName
        });
    }

    search = (e) => {
        e.preventDefault();
        const keyword = e.target.children[0].value;
        if(window.location.pathname === '/search')
            this.props.history.go(0);
        this.props.history.push({
            pathname: '/search',
            search: '?query=' + keyword
          });
    }

    render() {
        const userNavbar = this.state.userLoggedIn ? (<Link to='#'><i class="material-icons left">person</i>Hi, {this.state.firstName}</Link>) : '';
        const cart = this.state.userLoggedIn ? (<Link to='/cart'><i class="material-icons left">shopping_cart</i>Cart</Link>) : '';
        return (
            <div className='navbar'>
            <nav>
                <div className="nav-wrapper blue-grey">
                    <Link to="/" className="brand-logo">Online Courses</Link>
                    <a data-target="mobile-nav" class="sidenav-trigger"><i class="material-icons">menu</i></a>
                    <ul id="nav-mobile" className="hide-on-med-and-down">
                        <CategoryNav />
                        <li className='right'><Login history={this.props.history} userLoggedIn={this.userLoggedIn} /></li>
                        <li className='right'>{userNavbar}</li>
                        <li>
                            <form onSubmit={this.search}>
                                <input className='search-nav grey lighten-4' placeholder='Search for Courses' type='search' id='search'></input>
                            </form>
                        </li>
                    </ul>
                    <ul>
                        <li className='right'>{cart}</li>
                    </ul>
                </div>
            </nav>

            {/* Code for sidenav */}
            <ul class="sidenav" id="mobile-nav">
                <li><a href="#" data-target="mobile-categories" class="sidenav-trigger"><i class="material-icons left">apps</i>Categories</a></li>
                <li>{userNavbar}</li>
                <li>
                    <form onSubmit={this.search}>
                        <input className='search-nav grey lighten-4' placeholder='Search for Courses' type='search' id='search'></input>
                    </form>
                </li>
                <li className='login-sidenav'><Login mobile={true} history={this.props.history} userLoggedIn={this.userLoggedIn} /></li>
            </ul>
            <CategoryNav mobile={true}/>
            </div>
        )
    }
}

export default withRouter(Navbar);