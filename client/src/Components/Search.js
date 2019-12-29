import React, {Component} from 'react'
import CourseIndex from './CoursesIndex'

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
        }
    }

    async componentDidMount() {
        const keyword = this.props.location.search.split('?query=')[1];
        await this.setState({
            keyword
        });
    }

    async componentDidUpdate(prevProps) {
        if (prevProps != this.props) {
            const keyword = this.props.location.search.split('?query=')[1];
            await this.setState({
                keyword
            });
        }
    }

    render() {
        return (
            <div className='my-container'>
                <h4>Kết quả tìm kiếm cho: {this.state.keyword}</h4>
                <CourseIndex keyword={this.state.keyword} />
            </div>
        )
    }
}