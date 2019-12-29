import React, {Component} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

export default class CourseUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetUsername: '',
            firstName: '',
            lastName: '',
            aboutMe: '',
            password: '',
            role: '',
            hasPerm: false
        }
    }

    componentDidMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        const targetUsername = this.props.match.params.targetUsername;
        console.log(targetUsername);
        if (username !== targetUsername)
            axios.post('/api/get-user-info', {targetUsername}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }).then(res => {
                console.log(res);
                if (res.data.message !== 'user not found') {
                    let {firstName, lastName, aboutMe, role} = res.data.user;
                    this.setState({hasPerm: false, firstName, lastName, aboutMe, targetUsername, role});
                }
                else
                    console.log(res)
                    // this.props.history.push('/');
            }).catch(err => console.log(err))
            
        else
            axios.post('/api/get-my-info', {username}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }).then(res => {
                console.log(res);
                if (res.data.message !== 'unauthorized')
                {
                    let {firstName, lastName, aboutMe} = res.data.user;
                    this.setState({hasPerm: true, firstName, lastName, aboutMe, targetUsername});
                }
                else
                    this.props.history.push('/');
            }).catch(err => this.props.history.push('/'))
    }

    updateUserInfo = () => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        axios.post('/api/update-info', this.state, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            // if (res.data.message !== 'unauthorized')
            // {
            //     let {firstName, lastName, aboutMe} = res.data.user;
            //     this.setState({hasPerm: true, firstName, lastName, aboutMe, targetUsername});
            // }
            // else
            //     this.props.history.push('/');
        }).catch(err => this.props.history.push('/'))
    }

    render() {        
        const userInfoForm = this.state.hasPerm ? (
            <form onSubmit = {this.updateUserInfo}>         
            <div className="input-field">
                <input disabled id="targetUsername" type="text"/>
                <label htmlFor="targetUsername">{this.state.targetUsername}</label>
            </div>
            <div className="input-field">
                <input value={this.state.password} onChange={e => this.setState({password: e.target.value})} id="password" type="password"/>
                <label htmlFor="password">Mật khẩu</label>
            </div>
            <div className="input-field">
                <input value={this.state.lastName} placeholder="Họ" onChange={e => this.setState({lastName: e.target.value})} id="last_name" type="text" />
            </div>
            <div className="input-field">
                <input value={this.state.firstName} placeholder="Tên" onChange={e => this.setState({firstName: e.target.value})} id="first_name" type="text" />
            </div>
            <div className="input-field">
                <textarea value={this.state.aboutMe} placeholder="Giới thiệu bản thân" onChange={e => this.setState({aboutMe: e.target.value})} required id="about_me" class="materialize-textarea"></textarea>
            </div>
            <input type='submit' value='Cập nhật thông tin' className='btn blue-grey' />
        </form>) : (
            <div style={{fontSize: "1.1rem"}}>
                <p><b>Họ:</b> {this.state.lastName}</p>
                <p><b>Tên:</b> {this.state.firstName}</p>
                <p><b>Giới thiệu bản thân:</b> {this.state.aboutMe}</p>
                <p><b>Vai trò:</b> {this.state.role}</p>
            </div>
        )

        return (
            <div style={{paddingLeft: '20%', paddingRight: '20%', paddingTop: '30px'}} className='my-container'>
                <h4>Thông tin người dùng {this.props.match.params.targetUsername}</h4>
                {userInfoForm}
            </div>
        )
    }
}