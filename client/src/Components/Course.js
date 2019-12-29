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
        await axios.post('/api/course', {slug: this.props.location.pathname.split('/')[1]})
        .then(res => 
            {
                const username = localStorage.getItem('username');
                const token = localStorage.getItem('token');
                let data = res.data;

                if (data[0].ratings[0] == null)
                    data[0].ratings = data[0].ratings.slice(1)

                console.log(data);
                this.setState({
                    course: data
                });
                axios.post('/api/get-course-lessons', {courseId: res.data[0]._id})
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
                    toast.error("Xin hãy đăng nhập.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                else if (res.data.message === 'You have already purchased this course')
                    toast.error('Bạn đã sở hữu khóa học này.', {
                        position: toast.POSITION.TOP_CENTER
                    });
                else
                    toast.info('Đã thêm vào giỏ hàng', {
                        position: toast.POSITION.TOP_CENTER
                    });
            })
    }

    instructorExpand = () => {
        this.setState({
            instructorExpand: !this.state.instructorExpand
        });
    }

    userRating = (rating, name) => {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        console.log(rating)
        axios.post('/api/user-rating', {rating: rating, courseId: this.state.course[0]._id}, 
        {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }}).then(res =>{
            let data = res.data;
            if (res.data.message !== 'unauthorized')
            {
                let course = [...this.state.course];
                course[0].ratings.push(rating);
                this.setState({course});
            }
        }).catch(err => console.log(err))
    }

    render() {
        const course = this.state.course.map(course => {
            const lessons = this.state.lessons.map(lesson => {
                const preview = lesson.preview ? 'Preview' : ''
                return (<Link to={course.slug + '/lesson/' + lesson.slug} className="collection-item">{lesson.title}<i className="material-icons right">bookmark</i><span className='right red-text'>{preview}</span></Link>)
            });
            let courseRating = 0;
            if (course.ratings.length !== 0)
            {
                for (let i = 0; i < course.ratings.length; i++)
                    courseRating += course.ratings[i];
                courseRating /= course.ratings.length;
            }

            const ctaButtons = !this.state.userRolledIn ? (<button onClick={this.addToCart} className='teal waves-effect waves-light btn-large add-to-cart-btn'>Thêm vào giỏ hàng</button>) :
            (<button className='teal waves-effect waves-light btn-large add-to-cart-btn disabled'>Bạn đã sở hữu khóa học này.</button>);
            
            const hiddenInstructorExpand = this.state.instructorExpand ? course.instructor.aboutMe.slice(297) : '...';

            const instructorExpand = course.instructor.aboutMe.length < 300 ? <p>{course.instructor.aboutMe}</p> : (
                <p>{course.instructor.aboutMe.slice(0,297)}<span>{hiddenInstructorExpand}</span></p>
            )

            const readMoreInstructor = course.instructor.aboutMe.length < 300 ? '' : (
                <p onClick={this.instructorExpand} className='read-more-instructor green-text lighten-2'>{this.state.instructorExpand? 'THU LẠI' : 'MỞ RỘNG'}</p>
            );

            return (
                <div className='course'>
                    <div className='course-header grey darken-3'>
                        <div className='course-info white-text'>
                            <p className='course-title'>{course.title}</p>
                            <p className='course-short-description'>{course.shortDescription}</p>
                            <p className='course-instructor'>Giảng viên: <span className='red-text'>{course.instructor.firstName + ' ' + course.instructor.lastName}</span> <p>Cập nhật lần cuối {course.dateCreated.split('T')[0]}</p> </p>
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
                                changeRating={this.userRating}
                                name='rating'
                                starDimension="23px"
                                starSpacing="2px"
                            />
                            <span className='course-number-of-ratings'> ({course.ratings[0] == null ? 0 : course.ratings.length} đánh giá)</span>
                            {ctaButtons}
                            <div className='course-long-description'>
                                <h4>Chi tiết khóa học</h4>
                                <div dangerouslySetInnerHTML={{__html: course.longDescription}} />
                            </div>
                            <div className="course-instructor-info">
                                <h4 className="header">Thông tin giảng viên</h4>
                                <div className="card horizontal">
                                <div className="card-image">
                                    <img src={'/' + course.instructor.avatar} />
                                </div>
                                <div className="card-stacked">
                                    <div className="card-content">
                                        <Link to={'/user/' + course.instructor.username} className='course-instructor-info-header blue-text'>{course.instructor.firstName + ' ' + course.instructor.lastName}</Link>
                                        {instructorExpand}
                                        {readMoreInstructor}
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className='course-cta'>
                            <ul className="collection white">
                                <li className="collection-header center"><h5>Bài học</h5></li>
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