import React, {Component} from 'react'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import {Link} from 'react-router-dom'
import CategoryBreadcrumb from './CategoryBreadcrumb'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class Courses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course: [],
            lessons: [],
            userRolledIn: false,
            catPath: '/category',
            message: '',
            instructorExpand: false
        };
    }

    async componentWillMount() {
        let courseId = null;
        await axios.post('/api/course', {slug: this.props.location.pathname.split('/')[1]})
        .then(res => 
            {
                const username = localStorage.getItem('username');
                const token = localStorage.getItem('token');
                this.setState({
                    course: res.data
                });
                axios.post('/api/courselessons', {courseId: res.data[0]._id})
                .then(res2 => {
                    this.setState({
                        lessons: res2.data
                    });
                });
                axios.post('/api/check-course-auth', {courseId: res.data[0]._id, username},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }})
                .then(res3 => {
                    if (res3.data.message === 'authorized')
                        this.setState({
                            userRolledIn: true
                        });
                });
            });
            axios.post('/api/getcoursecat', {courseId: this.state.course[0]._id})
            .then(res => {
                if (res.data !== 'err')
                    this.setState({
                        catPath: res.data
                    });
            })
        }

    addToCart = () => {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        axios.post('/api/add-to-cart', {courseId: this.state.course[0]._id, username},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }}).then(res => {
                if (res.data.message === 'unauthorized')
                    toast.error("You don't have permission to do this. Please log in", {
                        position: toast.POSITION.TOP_CENTER
                    });
                else if (res.data.message === 'You have already purchased this course')
                    toast.error(res.data.message, {
                        position: toast.POSITION.TOP_CENTER
                    });
                else
                    toast.info(res.data.message, {
                        position: toast.POSITION.TOP_CENTER
                    });
            })
    }

    instructorExpand = () => {
        this.setState({
            instructorExpand: !this.state.instructorExpand
        });
    }

    render() {
        const course = this.state.course.map(course => {
            const lessons = this.state.lessons.map(lesson => {
                const preview = lesson.preview ? 'Preview' : ''
                return (<Link to={course.slug + 'lesson/' + lesson.slug} className="collection-item">{lesson.title}<i className="material-icons right">bookmark</i><span className='right red-text'>{preview}</span></Link>)
            });
            let courseRating = 0;
            if (course.ratings.length !== 0)
            {
                for (let i = 0; i < course.ratings.length; i++)
                    courseRating += course.ratings[i];
                courseRating /= course.ratings.length;
            }

            const ctaButtons = !this.state.userRolledIn ? (<span><button className='red waves-effect waves-light btn-large course-enroll-btn'>Enroll in this course</button>
            <button onClick={this.addToCart} className='teal waves-effect waves-light btn-large add-to-cart-btn'>Add To Cart</button></span>) :
            (<button className='teal waves-effect waves-light btn-large add-to-cart-btn disabled'>You have purchased this course.</button>);
            
            const hiddenInstructorExpand = this.state.instructorExpand ? course.instructor.aboutMe.slice(297) : '...';

            const instructorExpand = course.instructor.aboutMe.length < 300 ? <p>{course.instructor.aboutMe}</p> : (
                <p>{course.instructor.aboutMe.slice(0,297)}<span>{hiddenInstructorExpand}</span></p>
            )

            const readMoreInstructor = course.instructor.aboutMe.length < 300 ? '' : (
                <p onClick={this.instructorExpand} className='read-more-instructor green-text lighten-2'>{this.state.instructorExpand? 'READ LESS' : 'READ MORE'}</p>
            ) 

            return (
                <div className='course'>
                    <div className='course-header grey darken-3'>
                        <div className='course-info white-text'>
                            <p className='course-title'>{course.title}</p>
                            <p className='course-short-description'>{course.shortDescription}</p>
                            <p className='course-instructor'>Created by <span className='red-text'>{course.instructor.firstName + ' ' + course.instructor.lastName}</span> <p>Last updated {course.dateCreated.split('T')[0]}</p> </p>
                        </div>
                        <div className='course-picture'>
                            <img src={'/' + course.image} />
                        </div>
                    </div>
                    <div className='course-body'>
                            <div className='course-body-right'>
                            <StarRatings
                                // rating={course.ratings.length}
                                rating={courseRating}
                                starRatedColor="rgb(255, 187, 0)"
                                numberOfStars={5}
                                name='rating'
                                starDimension="23px"
                                starSpacing="2px"
                            />
                            <span className='course-number-of-ratings'> ({course.ratings.length} ratings)</span>
                            {ctaButtons}
                            <div className='course-long-description'>
                                <h4>Description</h4>
                                <div dangerouslySetInnerHTML={{__html: course.longDescription}} />
                            </div>
                            <div className="course-instructor-info">
                                <h4 className="header">About the Instructor</h4>
                                <div className="card horizontal">
                                <div className="card-image">
                                    <img src={'/' + course.instructor.avatar} />
                                </div>
                                <div className="card-stacked">
                                    <div className="card-content">
                                        <h6 className='course-instructor-info-header blue-text'>{course.instructor.firstName + ' ' + course.instructor.lastName}</h6>
                                        {instructorExpand}
                                        {readMoreInstructor}
                                    </div>
                                    <div className="card-action">
                                    <a href="#">Instructor's profile</a>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className='course-cta'>
                            <ul className="collection">
                                <li className="collection-header center"><h5>Lessons of this course</h5></li>
                                {lessons}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        });
        return (
            <div className='course'>
                <CategoryBreadcrumb path={this.state.catPath} />
                {course}
                <ToastContainer hideProgressBar={true} autoClose={3000} />
            </div>
        )
    }
}