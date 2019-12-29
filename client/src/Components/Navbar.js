import React, {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import Login from './Login'
import axios from 'axios'
import CategoryNav from './CategoryNav'
import LeadForm from './LeadForm'
import logo from '../static/images/LogoMakr_4XFQ3x.png'
import Popup from "reactjs-popup";
import DefaultAvatar from '../static/images/default-avatar.jpg'

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userLoggedIn: false,
            firstName: '',
            userAvatarOpen: false,
            role: 'Student'
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
            console.log(res);
            if (res.data.message === 'hey you made it')
                this.setState({
                    userLoggedIn: true,
                    firstName: res.data.firstName,
                    role: res.data.role
                });
        });
    }
    //If user logged in, show hello message on the navbar, if logged out, hide it
    userLoggedIn = (bool, firstName) => {
        this.setState({
            userLoggedIn: bool,
            firstName: firstName,
        });
    }

    search = (e) => {
        e.preventDefault();
        const keyword = e.target.children[0].value;
        this.props.history.push('/search?query=' + keyword);
    }

    openModal = () => {
        this.setState({ userAvatarOpen: true });
    }
      closeModal = () => {
        this.setState({ userAvatarOpen: false });
    }

    render() {
        const createCourse = this.state.role === 'Instructor' && this.state.userLoggedIn ? 
        <li className='right'><a className="teal-text" href='/instructor-admin'><i class="material-icons left">person_pin</i>Giảng viên</a></li> : ''
        const userLogIn = this.state.userLoggedIn ? '' : (<Login history={this.props.history} userLoggedIn={this.userLoggedIn} />)
        const userAvatar = this.state.userLoggedIn ? (
            <Popup open={this.state.userAvatarOpen}
            trigger={<img className="navbar-avatar" src={DefaultAvatar} />}
            position="bottom right" closeOnDocumentClick={true}
            on="click">
            <a href={'/user/' + localStorage.getItem('username')}>Chào mừng trở lại, {this.state.firstName}</a>
            <Login history={this.props.history} userLoggedIn={this.userLoggedIn} />
          </Popup>   
        ) : '';
        const cart = this.state.userLoggedIn ? (<a className="teal-text" href='/cart'><i class="material-icons left">shopping_cart</i>Giỏ hàng</a>) : '';
        const myCourse = this.state.userLoggedIn ? (<a className="teal-text" href='/my-course'><i class="material-icons left">school</i>Các khóa học của tôi</a>) : '';
        const newsletter = !this.state.userLoggedIn ? (<li className='right teal-text'><LeadForm/></li>) : '';
        return (
            <div className='navbar'>
            <nav>
                <div className="nav-wrapper white">
                    <Link to="/"><img className="brand-logo" src={logo} /></Link>
                    <a data-target="mobile-nav" class="sidenav-trigger"><i class="material-icons">menu</i></a>
                    <ul id="nav-mobile" className="hide-on-med-and-down">
                        <CategoryNav />
                        <li className='right'>{userLogIn}</li>
                        <li style={{lineHeight: '0'}} className='right'>{userAvatar}</li>
                        <li className='right'>{myCourse}</li>
                        {createCourse}
                        <li>
                            <form onSubmit={this.search}>
                                <input className='search-nav' placeholder='Tìm kiếm khóa học' type='search' id='search'></input>
                            </form>
                        </li>
                        {newsletter}
                    </ul>
                    <ul>
                        <li className='right'>{cart}</li>
                    </ul>
                </div>
            </nav>

            {/* Code for sidenav */}
            <ul class="sidenav" id="mobile-nav">
                <li>{userLogIn}</li>
                <li>{userAvatar}</li>
                <li>{myCourse}</li>
                <li><a href="#" data-target="mobile-categories" class="sidenav-trigger"><i class="material-icons left">apps</i>Danh mục</a></li>
                <li>
                    <form onSubmit={this.search}>
                        <input className='search-nav grey lighten-4' placeholder='Tìm khóa học' type='search' id='search'></input>
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