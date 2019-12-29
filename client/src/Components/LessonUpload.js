import React, {Component} from 'react'
import axios from 'axios'
import ImageUploader from 'react-images-upload';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default class LessonUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseTitle: '',
            title: '',
            course: '',
            number: 0,
            preview: false,
            content: ''
        }
    }

    componentDidMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        console.log(this.props.location.search);
        axios.post('/api/is-instructor-course', {username: username, courseId: this.props.location.search.replace('?courseId=', '')}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            if (res.data.message !== 'authorized')
                this.props.history.push('/');
            else
                this.setState({course: res.data.course._id, courseTitle: res.data.course.title, courseSlug: res.data.course.slug, number: res.data.lessons.length + 1});
        });
    }

    checkPreview = (e) => {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        
        this.setState({preview: value})
    }

    handleCreateLesson = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        await axios.post('/api/create-lesson', this.state, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            this.props.history.push('/' + this.state.courseSlug + '/lesson/' + res.data.slug);
        });
    }

    render() {
        return (
            <div style={{paddingLeft: '10%', paddingRight: '10%'}} className='my-container'>
                <h4 className='teal-text'>Tạo bài học cho khóa học {this.state.courseTitle}</h4>
                <form onSubmit={this.handleCreateLesson}>     
                    <div className="input-field">
                        <input onChange={e => this.setState({title: e.target.value})} id="title" type="text"/>
                        <label htmlFor="title">Tiêu đề bài học</label>
                    </div>
                    <label>
                        <input type="checkbox" class="filled-in" checked={this.state.preview}
                        onChange={this.checkPreview} />
                        <span>Cho phép xem miễn phí</span>
                    </label>
                    <div style={{marginTop: '20px'}}></div>
                    <CKEditor
                    editor={ ClassicEditor }
                    data="Nội dung bài học"
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        this.setState({content: data});} }/>
                    <input type="submit" value="Tạo" style={{marginTop: '20px'}} className='btn blue-grey'/>
                </form>
            </div>
        )
    }
}