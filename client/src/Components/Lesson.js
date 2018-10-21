import React, {Component} from 'react'
import axios from 'axios'
import {Tabs, Tab} from 'react-materialize'


export default class Courses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lesson: {
                course: {},
            },
            hasPerm: false
        };
    }

    async componentDidMount() {
        const path = this.props.location.pathname.split('/');
        const courseSlug = path[1];
        const lessonSlug = path[3];
        await axios.post('/api/lesson', {courseSlug, lessonSlug})
        .then(res => {
            if (res.data !== 'err')
            {
                res.data.content = res.data.content.replace('<div>&nbsp;</div>', '');
                this.setState({
                    lesson: res.data
                });
            }
        });
        if (this.state.lesson.preview === true)
            this.setState({
                hasPerm: true
            });
        else {
            const username = localStorage.getItem('username');
            const token = localStorage.getItem('token');
            await axios.post('/api/check-course-auth', {courseId: this.state.lesson.course._id, username: username}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }).then(res => {
                console.log(res);
                if (res.data.message === 'authorized')
                    this.setState({
                        hasPerm: true
                    });
            });
        }
        console.log(this.state.hasPerm);
    }

    render() {
        const lesson = this.state.lesson;

        const video = this.state.lesson.youtubeVid !== undefined ? (<div className="video-wrapper">
        <iframe width="672" height= '378' src={this.state.lesson.youtubeVid} allowFullScreen></iframe>
        </div>) : <p>This lesson doesn't have a video.</p>;

        const lessonContent = this.state.hasPerm ? (
            <Tabs>
                <Tab title="Content" active>
                    <div className='lesson-content' dangerouslySetInnerHTML={{__html: lesson.content}} />
                </Tab>
                <Tab title="Video">{video}</Tab>
            </Tabs>
        ) : (
            <Tabs>
                <Tab title="Content" active>
                    <p>You dont't have permission to view this content.</p>
                </Tab>
                <Tab title="Video"><p>You dont't have permission to view this content.</p></Tab>
            </Tabs>
        );

        return(
            <div className='lesson container'>
                <h4><a href={'/' + lesson.course.slug}>{lesson.course.title}</a></h4>
                <h5 className='teal-text'>Lesson {lesson.number}: {lesson.title}</h5>
                {lessonContent}
            </div>
        )
    }
}