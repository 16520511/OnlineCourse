import React, {Component} from 'react'
import CoursesIndex from './CoursesIndex'

class Home extends Component {
    search = (e) => {
        e.preventDefault();
        const keyword = e.target.children[0].value;
        this.props.history.push({
            pathname: '/search',
            search: '?query=' + keyword
          });
    }

    render() {
        return (
            <div className='homepage'>
                <div className='home-banner'>
                    <div className='banner-text white-text'>
                        <h2>Learn from the best</h2>
                        <h5>Study online anywhere, anytime with highly experienced experts from around the world.</h5>
                        <form onSubmit={this.search}>
                            <input className='banner-searchbar grey lighten-4' placeholder='What do you want to study?' type='search' id='search'></input>
                        </form>
                    </div>
                    <img width='100%' className='banner-image' src='/website-banner.jpg' />
                </div>
                <div className='my-container'>
                    <h3 className='teal-text'>Most Popular Courses</h3>
                    <CoursesIndex path='/api/courses' />
                </div>
            </div>
        )
    };
}

export default Home;