import React, {Component} from 'react'
import axios from 'axios'
import ImageUploader from 'react-images-upload';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default class CourseUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            instructor: '',
            pictures: '',
            category: '',
            price: 0,
            shortDescription: '',
            longDescription: '',
            catList: []
        }
    }

    componentDidMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        axios.post('/api/user-is-instructor', {username: username}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.data.message !== 'authorized')
                this.props.history.push('/');
            else
                this.setState({instructor: res.data.id})
        });

        axios.get('/api/cat-tree').then(res => {
            let data = res.data;
            let catList = [];
            for (let key in data){
                for (let j = 0; j < data[key].children.length; j++)
                    catList.push(data[key].children[j]);
            }

            this.setState({catList})
        });
    }

    handleCreateCourse = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        let data = {...this.state};

        data.username = username;

        let formData = new FormData();

        for ( var key in data ) {
            formData.append(key, data[key]);
        }

        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }

        console.log(this.state.pictures)

        await axios.post('/api/create-course', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if(Object.keys(res.data).length === 0 && res.data.constructor === Object)
                this.setState({error: 'Có lỗi trong quá trình tạo khóa học'})
            else
                this.props.history.push('/' + res.data.slug);
        });
    }

    onDrop = (pictureFiles) => {
        this.setState({pictures: pictureFiles[0]});
    }

    render() {
        const catListOptions = this.state.catList.map(cat => <option value={cat.id}>{cat.name}</option>);
        return (
            <div style={{paddingLeft: '10%', paddingRight: '10%'}} className='my-container'>
                <h4 className='teal-text'>Tạo một khóa học mới</h4>
                <form onSubmit={this.handleCreateCourse}>     
                    <div className="input-field">
                        <input onChange={e => this.setState({title: e.target.value})} id="title" type="text"/>
                        <label htmlFor="title">Tiêu đề khóa học</label>
                    </div>
                    <div className="input-field">
                        <input onChange={e => this.setState({shortDescription: e.target.value})} id="shortDescription" type="text"/>
                        <label htmlFor="shortDescription">Tóm tắt về khóa học</label>
                    </div>
                    <div className="input-field">
                        <input onChange={e => this.setState({price: e.target.value})} id="price" type="number"/>
                        <label htmlFor="price">Giá tiền</label>
                    </div>
                    <select onChange={e => this.setState({category: e.target.value})} style={{marginTop: '20px', marginBottom: '20px'}} className="browser-default">
                        <option value="" disabled selected>Chọn danh mục</option>
                        {catListOptions}
                    </select>
                    <CKEditor
                    editor={ ClassicEditor }
                    data="Chi tiết khóa học"
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        this.setState({longDescription: data});} }/>
                    <ImageUploader
                        withIcon={true} withPreview={true}
                        buttonText='Chọn hình đại diện'
                        onChange={this.onDrop}
                        imgExtension={['.jpg', '.png']}
                        maxFileSize={5242880}/>
                    <input type="submit" value="Tạo" style={{marginTop: '20px'}} className='btn blue-grey'/>
                </form>
            </div>
        )
    }
}