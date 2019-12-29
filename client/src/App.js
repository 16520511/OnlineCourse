import React, {Component} from 'react'
import './App.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Home from './Components/Home'
import Category from './Components/Category'
import Course from './Components/Course'
import Lesson from './Components/Lesson'
import Cart from './Components/Cart'
import CategoryNav from './Components/CategoryNav'
import Search from './Components/Search'
import MyCourse from './Components/MyCourse'
import CourseUpload from './Components/CourseUpload'
import InstructorAdmin from './Components/InstructorAdmin'
import LessonUpload from './Components/LessonUpload'
import UserInfo from './Components/UserInfo'

class App extends Component {
  render() {
    return (
        <div>
          <BrowserRouter>
              <div className='online-course-app'>
                <Navbar history={this.props.history} />
                <Switch>
                  <Route exact path='/' component={Home} />
                  <Route exact path='/cart' component={Cart} />
                  <Route exact path='/my-course' component={MyCourse} />
                  <Route exact path='/instructor-admin' component={InstructorAdmin} />
                  <Route path='/search' component={Search} />
                  <Route path='/user/:targetUsername' component={UserInfo} />
                  <Route path='/category/:cat' component={Category} />
                  <Route path='/test' component={CategoryNav} />
                  <Route path='/create-new-course/' component={CourseUpload} />
                  <Route path='/create-new-lesson/' component={LessonUpload} />
                  <Route path='/:course/lesson/:lesson' component={Lesson} />
                  <Route path='/:course/' component={Course} />
                </Switch>
              </div>
          </BrowserRouter>
        </div>
    );
  };
}

export default App;