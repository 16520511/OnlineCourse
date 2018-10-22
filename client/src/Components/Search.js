import React, {Component} from 'react'
import axios from 'axios'
import CourseIndex from './CoursesIndex'

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            courses: []
        }
    }

    async componentWillMount() {
        const keyword = this.props.location.search.split('?query=')[1];
        await this.setState({
            keyword
        });
    }

    render() {
        return (
            <div className='my-container'>
                <h4>Search results for: {this.state.keyword}</h4>
                <CourseIndex keyword={this.state.keyword} />
            </div>
        )
    }
}