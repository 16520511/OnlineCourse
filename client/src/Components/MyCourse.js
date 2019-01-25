import React, {Component} from 'react'
import axios from 'axios'
import CourseIndex from './CoursesIndex'

export default class Search extends Component {
    render() {
        return (
            <div className='my-container'>
                <h3 className='teal-text'>My Courses</h3>
                <CourseIndex hideCTA={true} myPost={true} />
            </div>
        )
    }
}