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
                    <img className='banner-image' src='/banner.png' />
                </div>
                <div className='my-container'>
                    <h4 style={{textAlign: 'center'}} className='teal-text'>Tại sao tôi nên chọn Online Course?</h4>
                    <div className="row" style={{paddingLeft: '30px', paddingRight: '30px', textAlign: 'center'}}>
                        <div className="col s3">
                            <img src="/d1.png"/>
                            <p style={{fontSize: '1.1rem'}}><b>Học trực tuyến</b></p>
                            <p>Mọi lúc mọi nơi</p>
                        </div>
                        <div className="col s3">
                            <img src="/d2.png"/>
                            <p style={{fontSize: '1.1rem'}}><b>Hoàn tiền</b></p>
                            <p>Nếu không hài lòng</p>
                        </div>
                        <div className="col s3">
                            <img src="/d3.png"/>
                            <p style={{fontSize: '1.1rem'}}><b>Thanh toán 1 lần</b></p>
                            <p>Học mãi mãi</p>
                        </div>
                        <div className="col s3">
                            <img style={{width: '128px'}} src="/d4.png"/>
                            <p style={{fontSize: '1.1rem'}}><b>Tốc độ cao</b></p>
                            <p>Không lo giật lag</p>
                        </div>
                    </div>
                    <h4 className='teal-text'>Các khóa học phổ biến</h4>
                    <CoursesIndex path='/api/courses' />
                </div>
            </div>
        )
    };
}

export default Home;