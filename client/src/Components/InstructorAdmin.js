import React, {Component} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

export default class CourseUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: []
        }
    }

    componentDidMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        axios.post('/api/instructor-courses', {username: username}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            if (res.data.message !== 'unauthorized')
                this.setState({courses: res.data});
            else
                this.props.history.push('/');
        }).catch(err => this.props.history.push('/'))

    }

    render() {
        const courses = this.state.courses.map(course => {
            let lessons = course.lessons.map(lesson => 
            <Link to={'/' + course._doc.slug + '/lesson/' + lesson.slug} class="collection-item">{lesson.title}</Link>)
            return (
            <li>
                <div class="collapsible-header">
                    <i class="material-icons teal-text">arrow_drop_down</i><Link to={course._doc.slug}>{course._doc.title}</Link>
                </div>
                <div style={{padding: '0px !important'}} class="collapsible-body instructor-course-item">
                    <div class="collection">
                        <li class="collection-item"><div>Bài học của khóa<Link class="secondary-content" to={'create-new-lesson?courseId=' + course._doc._id }><i class="material-icons">add</i></Link></div></li>
                        {lessons}
                    </div>
                </div>
            </li>)
        })
        
        return (
            <div style={{paddingLeft: '10%', paddingRight: '10%', paddingTop: '30px'}} className='my-container'>
                <Link style={{marginBottom: '30px'}} to='/create-new-course' className="btn">Tạo một khóa học mới</Link>
                <ul class="collapsible">
                    {courses}
                </ul>
            </div>
        )
    }
}