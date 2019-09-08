import React, {Component} from 'react'
import axios from 'axios'
import {Modal} from 'react-materialize'

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            register: false,
            err: '',
            username: '',
        }
    }

    //Check if user authenticated
    async componentWillMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        await axios.post('/api/checkAuth', {username: username}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.data.message === 'hey you made it')
                this.setState({
                    loggedIn: true
                });
        });
    }

    //Handling user log in
    userLogIn = (e) => {
        e.preventDefault();
        let username = e.target.children[0].children[0].value;
        let password = e.target.children[1].children[0].value;
        const user = {username: username, password: password}
        axios.post("/api/login", user)
        .then(res => {
            let err = ''
            if (res.data.token)
            {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', res.data.username);
                this.setState({
                    loggedIn: true,
                    open: false
                });
                window.location.reload();
                this.props.userLoggedIn(true, res.data.firstName);
            }
            else {
                //Login failed, show error message
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                err = res.data.message;
            }
            this.setState({
                err: err
            });
        });
    }

    //Handling user log out
    userLogOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.setState({
            loggedIn: false,
            open: false
        });
        this.props.history.push('/')
        this.props.userLoggedIn(false, '');
    }

    //Handling user register
    userRegister = (e) => {
        e.preventDefault();
        let username = e.target.children[0].children[0].value;
        let password = e.target.children[1].children[0].value;
        let firstName = e.target.children[2].children[0].value;
        let lastName = e.target.children[3].children[0].value;
        let isInstructor = e.target.children[4].children[0].children[0].checked ? 'true' : 'false';
        const user = {username, password, firstName, lastName, isInstructor};
        axios.post("/api/register", user)
        .then(res => {
            if (res.data.message === 'Register successfully.' || res.data.message === 'Instructor pending.')
            {
                let err = res.data.message === 'Register successfully.' ? 'You have register successfully, log in with your new account now.'
                : 'You have registered to be an instructor. Please wait for admin approval.';
                //Register successfully, redirect to login
                this.setState({
                    loggedIn: false,
                    register: false,
                    err: err
                });
            }
            else {
                //Register failed, show error message
                let errs = res.data.message;
                console.log(errs);
                if (errs.length === 2)
                    this.setState({
                        err: [errs[0].param + ': ' + errs[0].msg, errs[1].param + ': ' + errs[1].msg]
                    });
                else if (errs.length === 1)
                    this.setState({
                        err: errs[0].param + ': ' + errs[0].msg
                    });
                else 
                    this.setState({
                        err: errs
                    });
            }
        });
    }

    registerForm = () => {
        this.setState({
            register: true,
            err: ''
        });
        
    }

    loginForm = () => {
        this.setState({
            register: false, 
            err: ''
        });
    }

    render() {
        //Error messages
        const errMessage = !Array.isArray(this.state.err) ? (<h6 className='red-text center'>{this.state.err}</h6>)
        : (this.state.err.map(err => {
            return (<h6 className='red-text center'>{err}</h6>)
        }));

        let loggedIn = this.state.loggedIn ? ('Log Out') : ('Log In');
        let form = '';
        //If user is logged in, show log out form, otherwise show log in
        if (this.state.register === false) {
            form = this.state.loggedIn ? (
                <div>
                    <p className='teal-text'>It's sad to see you leave, {localStorage.getItem('username')}.</p>
                    <button onClick = {this.userLogOut} className='btn red lighten-1'>Click here to log out</button>
                </div>
            ) : (
                <div className=''>
                    <h5 className='teal-text center'>Log In With Your Online Course Account</h5>
                    <form onSubmit = {this.userLogIn}>
                        <div className="input-field">
                            <input id="username" type="text"/>
                            <label htmlFor="username">Username</label>
                        </div>
                        <div className="input-field">
                            <input id="password" type="password"/>
                            <label htmlFor="password">Password</label>
                        </div>
                        <button type='submit' className='btn blue-grey'>Log In</button>
                    </form>
                    {errMessage}
                    <div className='center'>
                        <h6><a className='teal-text text-darken-2' onClick={this.registerForm} href='#register'>Don't have an account? Click here to register</a></h6>
                    </div>
                </div>
            );
        }
        else {
            form = (
            <div>
                <h5 className='teal-text center'>Register A New Online Course Account</h5>
                <form onSubmit = {this.userRegister}>         
                    <div className="input-field">
                        <input id="username" type="text"/>
                        <label htmlFor="username">Username</label>
                    </div>
                    <div className="input-field">
                        <input id="password" type="password"/>
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className="input-field">
                        <input id="last_name" type="text" />
                        <label htmlFor="last_name">Last Name</label>
                    </div>
                    <div className="input-field">
                        <input id="first_name" type="text" />
                        <label htmlFor="first_name">First Name</label>
                    </div>
                    <p>
                        <label>
                            <input name='is_instructor' value='is_instructor' type="checkbox" className="filled-in" />
                            <span>I want to be an instructor (You are student by default).</span>
                        </label>
                    </p>
                    <input type='submit' value='Register' className='btn blue-grey' />
                </form>
                {errMessage}
                <div className='center'>
                    <h6><a className='teal-text text-darken-2' onClick={this.loginForm} href='#login'>Already have one? Click here to login.</a></h6>
                </div>
            </div>);
        }

        const modal = this.props.mobile ? (
            <Modal open={this.state.open} className="authModal"
                trigger={<button className='btn red lighten-1'>{loggedIn}</button>}>
                {form}
            </Modal>
        ) : (
            <Modal open={this.state.open} className="authModal"
                trigger={<a>{loggedIn}</a>}>
                {form}
            </Modal>
        )
        return (
            <div>
                {modal}
            </div>
        );
    }
}

