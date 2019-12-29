const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkauth.js');
const { check, validationResult } = require('express-validator/check');
const slugify = require('slugify');
const search = require('../search_engine');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/src/static/images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});
const upload = multer({storage: storage})

//Models
const User = require('../models/user');
const Course = require('../models/course');
const Category = require('../models/category');
const Lesson = require('../models/lesson');
const Cart = require('../models/cart');


mongoose.connect(`mongodb://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@ds237713.mlab.com:37713/onlinecourses`, { useNewUrlParser: true });

const api = express.Router();

//User login
api.post('/login', (req, res) => {
    if (req.body.username === '' || req.body.password === '') return res.send({message: 'Username and password are required.'});
    User.findOne({
        username: req.body.username
    }).exec()
    .then(user => {
        //Check if the account is active
        if (user.isActive === false) return res.send({message: 'Your account has not been approved.'});
        let password = user.password;
        let result = bcrypt.compareSync(req.body.password, password);
        if (result) {
            console.log(user)
            let token = jwt.sign({username: user.username, firstName: user.firstName, role: user.role}, 'huydeptrai', {expiresIn: '1h'});
            return res.send({message: 'Login successfully', token: token, username: user.username, firstName: user.firstName, role: user.role});
        }
        else return res.send({message: 'Login failed'});
    }).catch(err => res.send({message: 'Login failed'}));
});

//User Register
api.post('/register', [check('username').isLength({ min: 7 }), check('password').isLength({ min: 7 })], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ message: errors.array() });
    }
    //Requires all fields
    if (req.body.username === '' || req.body.password === '' || req.body.firstName === '' || req.body.lastName === '') 
        return res.send({message: 'All fields are required.'});
    User.find({
        username: req.body.username
    }).exec()
    .then(user => {
        if (user.length > 0) return res.send({message: 'Username already exists.'});
        else {
            bcrypt.hash(req.body.password, 10)
            .then(hash => {
                User.create({
                    username: req.body.username,
                    password: hash,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    aboutMe: req.body.aboutMe
                }, (err, user) => {
                    if (err) return res.send(err);

                    Cart.create({
                        user: user._id
                    }).then().catch();
                    //If the new user sign up to be an instructor, set isActive to false to wait for approval
                    if (req.body.isInstructor === 'true') {
                        User.updateOne({username: user.username}, {role: 'Instructor'}, (err, res) => {});
                    }

                    //User registered successfully and is activated.
                    return res.send({message: 'Register successfully.'});
                });
            }).catch(err => res.send(user));
        }
    }).catch(err => {
        res.send(err);
    })
});

//Check Authentication
api.post('/checkAuth', checkAuth, (req, res) => {
    res.send({message: 'hey you made it', firstName: req.firstName, role: req.role});
});

//Get All Users
api.get('/users', (req, res) => {
    User.find({})
    .exec().then(user => {
        res.send(user);
    }).catch(err => res.send(err));
})

//Get A User Info
api.post('/get-user-info', (req, res) => {
    User.findOne({username: req.body.targetUsername})
    .exec().then(user => {
        res.send({user});
    }).catch(err => res.send('user not found'));
})

//Get My Info
api.post('/get-my-info', checkAuth, (req, res) => {
    User.findOne({username: req.username})
    .exec().then(user => {
        res.send({user});
    }).catch(err => res.send('unauthorized'));
})

//Update User Info
api.post('/update-info', checkAuth, (req, res) => {
    if(req.body.password === '')
        User.findOneAndUpdate({username: req.username}, 
            {firstName: req.body.firstName, lastName: req.body.lastName, aboutMe: req.body.aboutMe})
            .exec()
            .then(user => res.send(user));
    else
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        User.findOneAndUpdate({username: req.username}, 
            {password: hash, firstName: req.body.firstName, lastName: req.body.lastName, aboutMe: req.body.aboutMe})
            .exec()
            .then(user => res.send(user));
    });
})

//Get All Courses
api.get('/courses', (req, res) => {
    Course.find({})
    .populate('instructor')
    .exec()
    .then(courses => 
    {
        var len = courses.length;
        for (var i = len-1; i>=0; i--){
            for(var j = 1; j<=i; j++){
              if(courses[j-1].ratings.length<courses[j].ratings.length){
                  var temp = courses[j-1];
                  courses[j-1] = courses[j];
                  courses[j] = temp;
               }
            }
          }
        res.send(courses.slice(0,21));
    })
    .catch(err => res.send(err));
});

//Get A Course
api.post('/course', (req, res) => {
    const slug = req.body.slug;
    Course.findOne({slug: slug.toLowerCase()})
    .populate('instructor')
    .exec()
    .then(course => res.send([course]))
    .catch(err => res.send(err));
});

//Get All User's Course
api.post('/my-courses', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
       Course.find({_id: {$in: user.courses}}).populate('instructor').exec()
       .then(courses => res.send(courses));
    }).catch(err => res.send({message: 'unauthorized'}));
})

//Get All Instructor's Course
api.post('/instructor-courses', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        if(user.role !== "Instructor")
            return res.send({message: 'unauthorized'})
        
        Course.find({instructor: user._id}).exec()
        .then(courses => {
            let courseIds = [];
            let courseData = [...courses]
            courseData.forEach((course, index) => {
                let courseClone = {...course};
                courseIds.push(course._id);
                courseClone.lessons = [];
                courseData[index] = courseClone;
            }, courseData);
            
            Lesson.find({course: {$in: courseIds}}).exec()
            .then(lessons => {
                courseData.forEach((course, index) => {
                    let courseClone = {...course};
                    lessons.forEach(lesson => {
                        if(String(lesson.course) === String(course._doc._id))
                            courseClone.lessons.push(lesson);
                    })

                    courseData[index] = courseClone;
                });
                res.send(courseData);
            })
        });
    }).catch(err => res.send({message: 'unauthorized'}));
})

//Check if user is instructor
api.post('/user-is-instructor', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        if(user.role == 'Instructor')
            res.send({message: 'authorized', id: user._id});
        else
            res.send({message: 'unauthorized'})
    }).catch(err => res.send({message: 'unauthorized'}));
})

//Create New Course
api.post('/create-course', checkAuth, upload.single('pictures'), (req, res) => {
    console.log(req.username == "");
    let data = {...req.body};
    data.image = req.file.originalname;
    Course.create(data).then(course => {
        course.slug = slugify(course.title.toLowerCase());
        course.save();
        res.send(course);
    }).catch(err => res.send(err));
});

api.get('/update-course', (req, res) => {
    Course.findOneAndUpdate({title: 'Lập trình JAVASCRIPT cơ bản'}, {image: 'javascript.jpg'}).exec()
    .then(course => res.send(course))
});

//Check if instructor own this course
api.post('/is-instructor-course', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        if(user.role == 'Instructor')
            Course.findOne({_id: req.body.courseId}).exec()
            .then(course => {
                Lesson.find({course: course._id}).exec()
                .then(lessons => res.send({message: 'authorized', course: course, lessons: lessons}))   
            }).catch(err => res.send({message: 'unauthorized'}))
        else
            res.send({message: 'unauthorized'})
    }).catch(err => res.send({message: 'unauthorized'}));
})

//Handle User Rating
api.post('/user-rating', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        console.log('Found User');
        console.log(req.body.courseId)
        Course.findOne({_id: req.body.courseId}).exec()
        .then(course => {
            console.log(req.body.courseId);
            console.log(user._id);
            console.log(course.ratedUsers);
            if(user.courses.indexOf(req.body.courseId) !== -1 && course.ratedUsers.indexOf(String(user._id)) === -1)
            {
                course.ratings.push(req.body.rating);
                course.ratedUsers.push(user._id);
                course.save();

                res.send(course);
            }
            else res.send({message: 'unauthorized'})
        })
    }).catch(err => res.send({message: 'unauthorized'}));
})

api.post('/create-lesson', checkAuth, (req, res) => {
    let data = {...req.body};
    Lesson.create(data).then(async (lesson) => {
        lesson.slug = await slugify(lesson.title.toLowerCase());
        if(lesson.number > 1)
            await Lesson.findOne({number: lesson.number - 1, course: lesson.course}).exec()
            .then(prev => {
                prev.nextLessonSlug = lesson.slug;
                prev.save();
                lesson.prevLessonSlug = prev.slug;
                lesson.save();
            })
        else
            lesson.save();
        res.send(lesson);
    }).catch(err => res.send(err));
});

api.get('/update-lesson', (req, res) => {
    Lesson.findOne({title: 'Tạo website ASP.NET MVC đầu tiên'}).exec()
    .then(async (lesson) => {
        if(lesson.number > 1)
            await Lesson.findOne({number: lesson.number - 1, course: lesson.course}).exec()
            .then(prev => {
                prev.nextLessonSlug = lesson.slug;
                prev.save();
                lesson.prevLessonSlug = prev.slug;
                lesson.save();
            })
        res.send(lesson);
    })
})

//Create New Category
api.get('/create-cat', (req, res) => {
    Category.create({
        name: 'Kinh Doanh Online',
        parent: '5e05d3b26b23da08f44ea5bb'
    }).then(cat => 
    {   
        Category.findById(cat._id)
        .populate('parent')
        .exec()
        .then(cate => {
            if (!cate.parent)
                cate.path = cate.name.replace(/ /g, '-').toLowerCase();
            else 
                cate.path = cate.parent.path + '/' + cate.name.replace(/ /g, '-').toLowerCase();
            cate.save();
            res.send(cate);
        });
    })
    .catch(err => res.send(err));
});

api.get('/delete-lesson', (req, res) => {
    Lesson.findOneAndRemove({title: 'Bài 3'}).exec(rs => console.log(res))
})

//Get All Categories
api.get('/categories', (req, res) => {
    // Category.findByIdAndUpdate('5bbf36549f890d091c24a7e2', {name: 'Development'})
    Category.find({}).then(cat => res.send(cat)).catch(err => res.send(err));
});

//Find the courses in the category
api.post('/category', async (req, res) => {
    Category.findOne({path: req.body.path})
    .populate('parent')
    .exec()
    .then(cat => {
        //If the category has parent => it is a child category => no children
        if (cat.parent)
            Course.find({category: cat._id}).populate('instructor').exec()
            .then(courses => 
            {
                var len = courses.length;
                for (var i = len-1; i>=0; i--){
                    for(var j = 1; j<=i; j++){
                      if(courses[j-1].ratings.length<courses[j].ratings.length){
                          var temp = courses[j-1];
                          courses[j-1] = courses[j];
                          courses[j] = temp;
                       }
                    }
                }
                res.send(courses)
            });
        //It has children category, find all courses in children
        else {
            Category.find({parent: cat._id})
            .exec()
            .then(childrenCat => {
                if(childrenCat.length > 0)
                {
                    let childrenCatId = []
                    for (let i = 0; i < childrenCat.length; i++)
                        childrenCatId.push(String(childrenCat[i]._id));
                    Course.find({category: { $in: childrenCatId }}).populate('instructor').exec()
                    .then(courses => {
                        var len = courses.length;
                        for (var i = len-1; i>=0; i--){
                            for(var j = 1; j<=i; j++){
                              if(courses[j-1].ratings.length<courses[j].ratings.length){
                                  var temp = courses[j-1];
                                  courses[j-1] = courses[j];
                                  courses[j] = temp;
                               }
                            }
                        }
                        res.send(courses)
                    })
                }
            });
        }
    }).catch(err => res.status(404).json(err));
});

//Get All Lessons Of A Course
api.post('/get-course-lessons', (req, res) => {
    Lesson.find({course: req.body.courseId})
    .sort({number: 1})
    .exec()
    .then(lessons => res.send(lessons))
    .catch(err => res.send(err));
});

//Get A Lesson
api.post('/lesson', (req, res) => {
    Lesson.findOne({slug: req.body.lessonSlug.toLowerCase()}).populate('course').exec()
    .then(lesson => {
        Lesson.findOne({slug: req.body.lessonSlug.toLowerCase()}).populate('course').exec()
        if(lesson.course.slug === req.body.courseSlug)
            return res.send(lesson);
        return res.send('err');
    }).catch(err => res.send('err'));
});

api.get('/add-next-prev-slug-lesson', (req, res) => {
    Lesson.find({}, function(err, lessons) {
        if (!err){
            res.send(lessons);
            for (let i = 0; i < lessons.length; i++)
            {
                let lesson = lessons[i]
                console.log(lesson.number)
                if (lesson.number !== 1)
                {
                    console.log("yes")
                    Lesson.findOne({number: lesson.number-1, course: lesson.course}, (err, prev) => {
                        // console.log(prev == null);
                        if(!err && prev !== null)
                        Lesson.findOneAndUpdate({_id: lesson._id}, {prevLessonSlug: prev.slug}, (err, raw) => {});
                        else
                        Lesson.findOneAndUpdate({_id: lesson._id}, {prevLessonSlug: ''}, (err, raw) => {});
                    });
                }
                else if (lesson.number === 1)
                    Lesson.findOneAndUpdate({_id: lesson._id}, {prevLessonSlug: ''}, (err, raw) => {});
                Lesson.findOne({number: lesson.number+1, course: lesson.course}, (err, next) => {
                    // console.log(next == null);
                    if(!err && next !== null)
                    Lesson.findOneAndUpdate({_id: lesson._id}, {nextLessonSlug: next.slug}, (err, raw) => {});
                    else
                    Lesson.findOneAndUpdate({_id: lesson._id}, {nextLessonSlug: ''}, (err, raw) => {});
                });
            }
        } else {throw err;}
    });
})

api.get('/update-user', (req, res) => {
    User.updateOne({username: 'teacher2'}, {aboutMe: `Trình độ chuyên môn: Thạc sĩ khoa học máy tính tốt nghiệp đại học quốc gia TP.HCM, Đại học Công Nghệ Thông Tin`}, (err, raw) => {res.send(err)});
});

api.get('/updatelesson', (req, res) => {
    // Lesson.find({}).exec()
    // .then(lessons => {
    //     for (let i = 0; i < lessons.length; i++) {
    //         Lesson.findByIdAndUpdate(lessons[i]._id, {slug: lessons[i].slug.toLowerCase()}, (err, raw) => {});
    //     }
    //     res.send(lessons);
    // })
    Lesson.findOneAndUpdate({title: 'Use "strict" tow write modern Javascript'}, {title: `Use "strict" to write modern Javascript`}, (err, raw) => {});
});

api.post('/getcoursecat', (req, res) => {
    Course.findById(req.body.courseId).exec()
    .then(course => {
        Category.findById(course.category).populate('parent').exec()
        .then(cat => res.send('/category/' + cat.path));
    }).catch(err => res.send('err'));
});
api.get('/updatecourse', (req, res) => {
    Course.findOneAndUpdate({title: 'C++ From Hero To Zero'}, {title: 'C++ Programming from Zero to Hero : The Fundamentals'}, (err, raw) => {res.send(raw)});
});

api.get('/cat-tree', async (req, res) => {
    let catTree = {};
    await Category.find({}).populate('parent').exec()
    .then(cats => {
        for (let i = 0; i < cats.length; i++)
        {
            if (cats[i].parent)
            {
                const parentName = cats[i].parent.name;
                if (catTree[parentName] === undefined)
                {
                    catTree[parentName] = {children: [{name: cats[i].name, path: cats[i].path, id: cats[i]._id}], path: cats[i].parent.path};
                } 
                else
                    catTree[parentName].children = [...catTree[parentName].children, {name: cats[i].name, path: cats[i].path, id: cats[i]._id}];
            }
        }
    });
    res.send(catTree);
})

api.post('/check-course-auth', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        if(user.courses.indexOf(req.body.courseId) !== -1)
        {
            return res.send({message: 'authorized'});
        }
        else
        Course.findOne({_id: req.body.courseId}).exec()
        .then(course => {
            console.log(typeof String(course.instructor));
            console.log(typeof String(user._id));
            if(String(course.instructor) == String(user._id)) {
                console.log('true');
                return res.send({message: 'authorized'})
            }
            else
                return res.send({message: 'unauthorized'})
        }).catch(err => res.send({message: 'unauthorized'}))
    }).catch(err => res.send({message: 'unauthorized'}));
})

api.post('/cart', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        Cart.findOne({user: user._id}).populate({path : 'courses', populate : {path : 'instructor'}}).exec()
        .then(cart => res.send(cart))
    }).catch(err => res.send({message: 'unauthorized'}));
});

api.post('/add-to-cart', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        if (user.courses.indexOf(req.body.courseId) !== -1)
            return res.send({message: "You have already purchased this course"});
        Cart.findOne({user: user._id}).exec()
        .then(cart => {
            if(cart.courses.indexOf(req.body.courseId) === -1)
            {
                cart.courses.push(req.body.courseId);
                cart.save();
                return res.send({message: 'This course has been added to your cart'});
            }
            else return res.send({message: 'This course has already been added to your cart'});
        })
    }).catch(err => res.send({message: 'unauthorized'}));
})

api.post('/remove-cart-item', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        Cart.findOne({user: user._id}).populate({path : 'courses', populate : {path : 'instructor'}}).exec()
        .then(cart => {
            if(req.body.removeAll === true)
                cart.courses = [];
            else {
                let cartItems = cart.courses.slice();
                const newCartItems = cartItems.filter(item => {
                    return (item._id != req.body.courseId);
                });
                cart.courses = newCartItems;
            }
            cart.save();
            res.send(cart.courses);
        })
    }).catch(err => res.send({message: 'unauthorized'}));
});

api.post('/cart-checkout', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
        Cart.findOne({user: user._id}).exec()
        .then(cart => {
            user.courses.push(...cart.courses);
            user.save();
            cart.courses = [];
            cart.save();
            res.send(cart);
        })
    }).catch(err => res.send({message: 'unauthorized'}));
});

api.get('/lessons', (req, res) => {
    Lesson.find({}).exec()
    .then(lessons => res.send(lessons));
})

api.post('/search', async (req, res) => {
    const courses = await search.SimpleSearch(req.body.keyword);
    var len = courses.length;
    for (var i = len-1; i>=0; i--){
        for(var j = 1; j<=i; j++){
          if(courses[j-1].relevant<courses[j].relevant){
              var temp = courses[j-1];
              courses[j-1] = courses[j];
              courses[j] = temp;
           }
        }
    }
    res.send(courses);
})

module.exports = api;