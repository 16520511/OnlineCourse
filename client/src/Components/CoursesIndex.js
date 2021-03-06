import React, {Component} from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StarRatings from 'react-star-ratings'

export default class CoursesIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: undefined,
            totalCourses: 0,
            currentPage: 1
        };
    }
    
    //Make axios request for the courses.
    makeAxiosRequest = async (path, body, page, keyword, myPost) => {
        if (myPost === true) {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            await axios.post('/api/my-courses', {username: username}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }).then(res => {
                const courses = res.data.map(course => {
                    course.ctaDisplay = 'none';

                    if(course.ratings[0] == null)
                        course.ratings = course.ratings.slice(1);

                    return course;
                });
                if (res.data.message !== 'unauthorized')
                    this.setState({
                        courses: courses.slice((page-1)*10, page*10),
                        totalCourses: courses.length,
                        currentPage: page
                    });
            });
        }
        else if (body === undefined && keyword === undefined)
        {
            await axios.get(path)
            .then(res => {
                let data = res.data.slice(0, 10)
                const courses = data.map(course => {
                    if(course.ratings[0] == null)
                        course.ratings = course.ratings.slice(1);

                    course.ctaDisplay = 'none';
                    return course;
                });
                this.setState({
                    courses: courses.slice((page-1)*10, page*10),
                    totalCourses: courses.length,
                    currentPage: page
                });
            });
        }
        else if (body === undefined && keyword !== undefined)
            axios.post('/api/search', {keyword})
            .then(res => {
                const courses = res.data.map(course => {
                    if(course.ratings[0] == null)
                        course.ratings = course.ratings.slice(1);

                    course.ctaDisplay = 'none';
                    return course;
                });
                this.setState({        
                    courses: courses.slice((page-1)*10, page*10),
                    totalCourses: courses.length,
                    currentPage: page
                });
            });
        else {
            await axios.post(path, {path: body})
            .then(res => {
                const courses = res.data.map(course => {
                    if(course.ratings[0] == null)
                        course.ratings = course.ratings.slice(1);
                    
                        course.ctaDisplay = 'none';
                    return course;
                });
                this.setState({
                    courses: courses.slice((page-1)*10, page*10),
                    totalCourses: courses.length,
                    currentPage: page
                });
            });
        }
    }

    async componentDidMount() {
        const path = this.props.path;
        const body = this.props.body;
        const keyword = this.props.keyword;
        const myPost = this.props.myPost;
        await this.makeAxiosRequest(path, body, 1, keyword, myPost);
    }


    //Component Update In Search Page
    async componentDidUpdate(prevProps) {
        if(this.props.keyword !== prevProps.keyword) {
            this.setState({courses: undefined})
            const path = this.props.path;
            const body = this.props.body;
            const keyword = this.props.keyword;
            const myPost = this.props.myPost;
            await this.makeAxiosRequest(path, body, 1, keyword, myPost);
        }
    }

    //When user hover the mouse over a course, show call to action button.
    showCTA = (id, action) => {
        const courses = this.state.courses.map(course => {
            if (course._id === id)
                course.ctaDisplay = action === 'enter' ? 'initial' : 'none';
            return course;
        });
        this.setState({
            courses
        });
    }
    //Go to the page when clicked the pagination button
    paginationClick = async (page, disabled) => {
        if (page !== this.state.currentPage && disabled !== 'disabled')
        {
            const path = this.props.path;
            const body = this.props.body;
            const keyword = this.props.keyword;
            const myPost = this.props.myPost;
            await this.makeAxiosRequest(path, body, page, keyword, myPost);
        }
    }

    CTAClick = (e, id) => {
        e.preventDefault();
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        axios.post('/api/add-to-cart', {courseId: id, username},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
        }})
        .then(res => {
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
        });
    }

    render() {
        //Show courses
        const coursesGrid = this.state.courses !== undefined ? this.state.courses.map(course => {
            let courseRating = 0;
            if (course.ratings.length !== 0)
            {
                for (let i = 0; i < course.ratings.length; i++) 
                    courseRating += course.ratings[i];
                courseRating /= course.ratings.length;
            }
            const CTAbutton = this.props.hideCTA === true ? '' : (
                <button onClick={(e) => {this.CTAClick(e, course._id)}} style={{display: `${course.ctaDisplay}`}} className='btn course-index-cta'>Thêm vào giỏ hàng</button>
            )
            const title = course.title.length > 45 ? (course.title.slice(0, 47) + '...') : course.title;
            return (
                <div className='course-index-card' onMouseEnter={() => this.showCTA(course._id, 'enter')} onMouseLeave={() => {this.showCTA(course._id, 'leave')}}>
                    <a href={'/' + course.slug}>
                    <div className='card-image'>
                        <img className='course-image' src={'/' + course.image} alt={course.title}/>
                    </div>
                    <div className="card-content">
                        <p className='course-index-title'>{title}</p>
                        <p className='teal-text course-index-instructor'>{course.instructor.firstName + ' ' + course.instructor.lastName}</p>
                        <p className='black-text course-index-price right'>${course.price}</p>
                        <StarRatings
                                // rating={course.ratings.length}
                                rating={courseRating}
                                starRatedColor="rgb(255, 187, 0)"
                                numberOfStars={5}
                                name='rating'
                                starDimension="18px"
                                starSpacing="1px"
                            />
                            <span className='course-number-of-ratings'> ({course.ratings[0] == null ? 0 : course.ratings.length})</span>
                        {CTAbutton}
                    </div>
                    <div className='card-footer'></div></a>
                </div>
            );
        }) : '';

        const coursesIndex = this.state.courses === undefined ? 
        (<div class="preloader-wrapper big active">
            <div class="spinner-layer spinner-teal-only">
            <div class="circle-clipper left">
                <div class="circle"></div>
            </div><div class="gap-patch">
                <div class="circle"></div>
            </div><div class="circle-clipper right">
                <div class="circle"></div>
            </div>
            </div>
        </div>) :
        (<div className='course-index-grid'>
            {coursesGrid}
        </div>);

        //Set the pagination buttons
        const pagination = [];
        for (let i = 0; i < this.state.totalCourses/10; i++)
        {
            const active = this.state.currentPage === i+1 ? 'active' : '';
            pagination.push(<li onClick={() => {this.paginationClick(i+1)}} className={"waves-effect " + active}><a>{i+1}</a></li>);
        }

        //Set the disabled status for the arrow in pagination
        const backDisabled = this.state.currentPage === 1 ? 'disabled' : 'waves-effect';
        const nextDisabled = (this.state.currentPage+1 > Math.ceil(this.state.totalCourses/10)) ? 'disabled' : 'waves-effect';

        return (
            <div className='course-index'>
                {coursesIndex}
                <ul class="pagination">
                    <li className={backDisabled} onClick={() => {this.paginationClick(this.state.currentPage-1, backDisabled)}}><a><i className="material-icons">chevron_left</i></a></li>
                    {pagination}
                    <li className={nextDisabled} onClick={() => {this.paginationClick(this.state.currentPage+1, nextDisabled)}}><a><i className="material-icons">chevron_right</i></a></li>
                </ul>
                <ToastContainer hideProgressBar={true} autoClose={3000} />
            </div>
        );
    }
}