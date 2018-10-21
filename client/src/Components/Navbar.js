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
            console.log(res.data);
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

    render() {
        const userNavbar = this.state.userLoggedIn ? (<li className='right'><Link to='#'><i class="material-icons left">person</i>Hi, {this.state.firstName}</Link></li>) : '';
        const cart = this.state.userLoggedIn ? (<li className='right'><Link to='/cart'><i class="material-icons left">shopping_cart</i>Cart</Link></li>) : '';
        return (
            <div className='navbar'>
            <nav>
                <div className="nav-wrapper blue-grey">
                    <Link to="/" className="brand-logo">Online Course</Link>
                    <ul id="nav-mobile" className="hide-on-med-and-down">
                        <CategoryNav />
                        <li className='right'><Login history={this.props.history} userLoggedIn={this.userLoggedIn} /></li>
                        {userNavbar}
                        {cart}
                        <li>
                            <form>
                                <input className='search-nav grey lighten-4' placeholder='Search for Courses' type='search' id='search'></input>
                            </form>
                        </li>
                    </ul>
                </div>
            </nav>
            </div>
        )
    }
}

export default withRouter(Navbar);