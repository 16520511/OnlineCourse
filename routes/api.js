const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkauth.js');
const { check, validationResult } = require('express-validator/check');
const slugify = require('slugify');
const search = require('../search_engine');

//Models
const User = require('../models/user');
const Course = require('../models/course');
const Category = require('../models/category');
const Lesson = require('../models/lesson');
const Cart = require('../models/cart');

// mongoose.connect('mongodb://localhost/onlinecourse');
mongoose.connect('mongodb://lokatto:gotohell8900@ds237713.mlab.com:37713/onlinecourses');

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
            let token = jwt.sign({username: user.username, firstName: user.firstName}, 'huydeptrai', {expiresIn: '1h'});
            return res.send({message: 'Login successfully', token: token, username: user.username, firstName: user.firstName});
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
                    lastName: req.body.lastName
                }, (err, user) => {
                    if (err) return res.send(err);

                    Cart.create({
                        user: user._id
                    }).then().catch();
                    //If the new user sign up to be an instructor, set isActive to false to wait for approval
                    if (req.body.isInstructor === 'true') {
                        User.updateOne({username: user.username}, {isActive: false, role: 'Instructor'}, (err, res) => {});
                        return res.send({message: 'Instructor pending.'});
                    }

                    //User registered successfully and is activated.
                    else return res.send({message: 'Register successfully.'});
                });
            }).catch(err => res.send(user));
        }
    }).catch(err => {
        res.send(err);
    })
});

api.post('/checkAuth', checkAuth, (req, res) => {
    res.send({message: 'hey you made it', firstName: req.firstName});
});

api.get('/users', (req, res) => {
    User.find({})
    .exec().then(user => {
        res.send(user);
    }).catch(err => res.send(err));
})

api.get('/courses', (req, res) => {
    // Course.findById('5bbf383c88884621b4d1823e').exec()
    // .then(course => {
    //     course.ratings = [...course.ratings, 4, 5, 5, 3, 5, 4];
    //     course.save();
    // })
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

api.post('/course', (req, res) => {
    const slug = req.body.slug;
    Course.findOne({slug: slug.toLowerCase()})
    .populate('instructor')
    .exec()
    .then(course => res.send([course]))
    .catch(err => res.send(err));
});

api.post('/my-course', checkAuth, (req, res) => {
    User.findOne({username: req.username}).exec()
    .then(user => {
       Course.find({_id: {$in: user.courses}}).populate('instructor').exec()
       .then(courses => res.send(courses));
    }).catch(err => res.send({message: 'unauthorized'}));
})

api.get('/createcourse', (req, res) => {
    Course.create({
        title: 'The Complete Networking Fundamentals Course. Your CCNA start',
        instructor: '5bcbf02b87545e129c32ba81',
        image: 'networking-fundamentals.jpg',
        category: '5bbf3677d230a12f1c49ed4d',
        ratings: [5, 4, 4, 3, 5, 4, 4, 5, 5],
        price: 23,
        shortDescription: 'Learn about networking and start your journey to CCNA',
        longDescription: `<p>Welcome to the Complete Network Fundamentals Course! In this course, you will learn the technologies that keep the world as you know today connected and running.</p> <p>Networks are all around us and you are using one right now to access this course.</p> <p><strong><u>Imagine</u></strong>&nbsp;for a moment, how different your life would be without access to Facebook, Snapchat, Google, YouTube, Whatsapp or any of the other websites on the Internet? How would you live with&nbsp;<strong><u>no Internet</u></strong>?</p> <p>The Internet is extremely important in modern life today and all websites and Internet communication relies on networking. This reliance is only predicted to continue with the growth of the Internet of Things (IoT) in the next few years.</p> <p><strong>Without routers, switches, network cabling and protocols like BGP there would be no Internet!</strong></p> <p><strong>This course will teach you how networks actually work&nbsp;</strong>and how you are able to connect to websites like Facebook, Google, and YouTube.</p> <p>Companies throughout the world (from the smallest to the largest) rely on networks designed, installed and maintained by networking engineers. Join this in demand industry!</p> <p><strong>Start your journey today learning about networking.</strong></p> <p>Content in this course can be used towards&nbsp;<strong>your CCNA.&nbsp;</strong>Topics such as IP addressing, subnetting and many others can be applied directly to passing your CCNA certification.</p> <p>Access our online simulations so you&nbsp;<strong>can practice</strong>&nbsp;on simulated Cisco routers and switches. You will get to type commands such as enable, configure terminal, router ospf and many others and learn how to configure devices.</p> <p>I want to welcome you to this Complete Networking Fundamentals course! I'm David Bombal, and I have been teaching networking courses for over 15 years. I qualified as a Cisco Certified Interwork Engineer (CCIE) in 2003 and hold with numerous other networking certifications. I'm also a Cisco and HPE certified instructor where I have trained thousands of networking engineers in many of the largest companies in the world including Fortune 100 companies.</p> <p>I have designed this course for anyone wanting to learn more about networking and gain foundational knowledge, to help them embark on their networking career. The concepts taught in this course can be applied directly to multiple industry certifications including the Cisco Certified Network Associate (CCNA).</p> <p>In this course, you will learn about topics such as IP addressing, IP subnetting, Routing, Switches, VLANs, Spanning Tree, Network Address Translation, Wireless and a whole lot more.</p> <p>You will also learn more about the latest networking trends including OpenFlow and Software Defined Networking.</p> <p>The course covers the following topics including (and this list will be constantly updated):</p> <ul> <li>Network basics</li> <li>Network architectures (OSI Model)</li> <li>What are hubs, switches, routers?</li> <li>How is data forwarded through a network?</li> <li>IP addresses</li> <li>IP subnetting</li> <li>Cabling and network topologies</li> <li>Ethernet basics</li> <li>TCP and UDP</li> <li>DNS and DHCP</li> <li>Routing</li> <li>VLANs</li> <li>Cisco device initial configurations</li> <li>ACLs</li> <li>Network naming</li> <li>IP Telephony</li> <li>Quality of Service (QoS)</li> <li>SDN and OpenFlow</li> </ul> <p>&nbsp;</p> <p>At the end of this course, you will be able to confidently discuss networking topics; and be able to start configuring real networking devices such as routers and switches. In this an introductory course, but contains a lot of information that can be directly applied to the CCNA certification.</p> <p>The ideal student for this course is someone looking to break into the networking field, someone looking to extend their knowledge from PCs and servers to networking, or someone interested in getting knowledge to work in one of the most exciting, most in-demand jobs in IT - networking.</p> <p>There are no requirements necessary to enroll in this course, I only ask that you come open minded and ready to learn.</p> <p>Feel free to take a look at the course description and some of the sample free videos.</p> <p>I look forward to seeing you on the inside!</p> <p>&nbsp;</p> <div class="audience" data-purpose="course-audience"> <div class="audience__title">Who is the target audience?</div> <ul class="audience__list"> <li>Anyone wanting to learn about networking</li> <li>If you want to start your journey to CCNA</li> </ul> </div>`
    }).then(course => {
        course.slug = slugify(course.title.toLowerCase());
        course.save();
        return res.send(course);
    }).catch(err => res.send(err));
});

api.get('/create-cat', (req, res) => {
    Category.create({
        name: 'Design Tools',
        parent: '5bcadc6f296b4e343825b5c9'
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

api.get('/createlesson', (req, res) => {
    Lesson.create({
        title: 'Variable Scopes',
        course: '5bc013b69e0cc52220421997',
        number: 6,
        preview: true,
        content: `<p>A scope is a region of the program and broadly speaking there are three places, where variables can be declared &minus;</p> <ul class="list"> <li> <p>Inside a function or a block which is called local variables,</p> </li> <li> <p>In the definition of function parameters which is called formal parameters.</p> </li> <li> <p>Outside of all functions which is called global variables.</p> </li> </ul> <p>We will learn what is a function and it's parameter in subsequent chapters. Here let us explain what are local and global variables.</p> <h2>Local Variables</h2> <p>Variables that are declared inside a function or block are local variables. They can be used only by statements that are inside that function or block of code. Local variables are not known to functions outside their own. Following is the example using local variables &minus;</p> <p><a class="demo" href="http://tpcg.io/QIjnPh" target="_blank" rel="nofollow">&nbsp;Live Demo</a></p> <pre class="prettyprint notranslate prettyprinted"><span class="com">#include</span> <span class="str">&lt;iostream&gt;</span> <span class="kwd">using</span> <span class="kwd">namespace</span><span class="pln"> std</span><span class="pun">;</span> <span class="kwd">int</span><span class="pln"> main </span><span class="pun">()</span> <span class="pun">{</span> <span class="com">// Local variable declaration:</span> <span class="kwd">int</span><span class="pln"> a</span><span class="pun">,</span><span class="pln"> b</span><span class="pun">;</span> <span class="kwd">int</span><span class="pln"> c</span><span class="pun">;</span> <span class="com">// actual initialization</span><span class="pln"> a </span><span class="pun">=</span> <span class="lit">10</span><span class="pun">;</span><span class="pln"> b </span><span class="pun">=</span> <span class="lit">20</span><span class="pun">;</span><span class="pln"> c </span><span class="pun">=</span><span class="pln"> a </span><span class="pun">+</span><span class="pln"> b</span><span class="pun">;</span><span class="pln"> cout </span><span class="pun">&lt;&lt;</span><span class="pln"> c</span><span class="pun">;</span> <span class="kwd">return</span> <span class="lit">0</span><span class="pun">;</span> <span class="pun">}</span></pre> <h2>Global Variables</h2> <p>Global variables are defined outside of all the functions, usually on top of the program. The global variables will hold their value throughout the life-time of your program.</p> <p>A global variable can be accessed by any function. That is, a global variable is available for use throughout your entire program after its declaration. Following is the example using global and local variables &minus;</p> <p><a class="demo" href="http://tpcg.io/dRHHpD" target="_blank" rel="nofollow">&nbsp;Live Demo</a></p> <pre class="prettyprint notranslate prettyprinted"><span class="com">#include</span> <span class="str">&lt;iostream&gt;</span> <span class="kwd">using</span> <span class="kwd">namespace</span><span class="pln"> std</span><span class="pun">;</span> <span class="com">// Global variable declaration:</span> <span class="kwd">int</span><span class="pln"> g</span><span class="pun">;</span> <span class="kwd">int</span><span class="pln"> main </span><span class="pun">()</span> <span class="pun">{</span> <span class="com">// Local variable declaration:</span> <span class="kwd">int</span><span class="pln"> a</span><span class="pun">,</span><span class="pln"> b</span><span class="pun">;</span> <span class="com">// actual initialization</span><span class="pln"> a </span><span class="pun">=</span> <span class="lit">10</span><span class="pun">;</span><span class="pln"> b </span><span class="pun">=</span> <span class="lit">20</span><span class="pun">;</span><span class="pln"> g </span><span class="pun">=</span><span class="pln"> a </span><span class="pun">+</span><span class="pln"> b</span><span class="pun">;</span><span class="pln"> cout </span><span class="pun">&lt;&lt;</span><span class="pln"> g</span><span class="pun">;</span> <span class="kwd">return</span> <span class="lit">0</span><span class="pun">;</span> <span class="pun">}</span></pre> <p>A program can have same name for local and global variables but value of local variable inside a function will take preference. For example &minus;</p> <p><a class="demo" href="http://tpcg.io/dt7MP9" target="_blank" rel="nofollow">&nbsp;Live Demo</a></p> <pre class="prettyprint notranslate prettyprinted"><span class="com">#include</span> <span class="str">&lt;iostream&gt;</span> <span class="kwd">using</span> <span class="kwd">namespace</span><span class="pln"> std</span><span class="pun">;</span> <span class="com">// Global variable declaration:</span> <span class="kwd">int</span><span class="pln"> g </span><span class="pun">=</span> <span class="lit">20</span><span class="pun">;</span> <span class="kwd">int</span><span class="pln"> main </span><span class="pun">()</span> <span class="pun">{</span> <span class="com">// Local variable declaration:</span> <span class="kwd">int</span><span class="pln"> g </span><span class="pun">=</span> <span class="lit">10</span><span class="pun">;</span><span class="pln"> cout </span><span class="pun">&lt;&lt;</span><span class="pln"> g</span><span class="pun">;</span> <span class="kwd">return</span> <span class="lit">0</span><span class="pun">;</span> <span class="pun">}</span></pre> <p>When the above code is compiled and executed, it produces the following result &minus;</p> <pre class="result notranslate">10 </pre> <h2>Initializing Local and Global Variables</h2> <p>When a local variable is defined, it is not initialized by the system, you must initialize it yourself. Global variables are initialized automatically by the system when you define them as follows &minus;</p> <table class="table table-bordered"> <tbody> <tr> <th width="50%">Data Type</th> <th>Initializer</th> </tr> <tr> <td>int</td> <td>0</td> </tr> <tr> <td>char</td> <td>'\0'</td> </tr> <tr> <td>float</td> <td>0</td> </tr> <tr> <td>double</td> <td>0</td> </tr> <tr> <td>pointer</td> <td>NULL</td> </tr> </tbody> </table> <p>It is a good programming practice to initialize variables properly, otherwise sometimes program would produce unexpected result.</p>`
    }).then(lesson => {
        lesson.slug = slugify(lesson.title.toLowerCase());
        lesson.save();
        res.send(lesson);
    });
});

api.post('/courselessons', (req, res) => {
    Lesson.find({course: req.body.courseId})
    .sort({number: 1})
    .exec()
    .then(lessons => res.send(lessons))
    .catch(err => res.send(err));
});

api.post('/lesson', (req, res) => {
    Lesson.findOne({slug: req.body.lessonSlug.toLowerCase()}).populate('course').exec()
    .then(lesson => {
        if(lesson.course.slug === req.body.courseSlug)
            return res.send(lesson);
        return res.send('err');
    }).catch(err => res.send('err'));
});

// api.get('/updateuser', (req, res) => {
//     User.updateOne({username: 'hellobaby'}, {courses: ['5bbf383c88884621b4d1823e']}, (err, raw) => {res.send(err)});
// });

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
    // await Category.find({}).exec()
    // .then(cats => {
    //     for (let i = 0; i < cats.length; i++)
    //     {
    //         if (!cats[i].parent)
    //         {
    //             Category.find({parent: cats[i]._id}).exec()
    //             .then(children => {
    //                 let childrenName = []
    //                 for (let j = 0; j < children.length; j++)
    //                     childrenName.push(children[j].name);
    //                 catTree[cats[i].name] = childrenName.slice();
    //                 console.log(catTree);
    //             })
    //         }
    //     }
    // });
    await Category.find({}).populate('parent').exec()
    .then(cats => {
        for (let i = 0; i < cats.length; i++)
        {
            if (cats[i].parent)
            {
                const parentName = cats[i].parent.name;
                if (catTree[parentName] === undefined)
                {
                    catTree[parentName] = {children: [{name: cats[i].name, path: cats[i].path}], path: cats[i].parent.path};
                } 
                else
                    catTree[parentName].children = [...catTree[parentName].children, {name: cats[i].name, path: cats[i].path}];
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
        return res.send({message: 'unauthorized'});
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

api.get('/updateuser', (req, res) => {
    User.findByIdAndUpdate('5bcbedf800a8cd295481911c', {aboutMe: `Sharing is who I am, and teaching is where I am at my best, because I've been on both sides of that equation, and getting to deliver useful training is my meaningful way to be a part of the creative community.

    I've spent a long time watching others learn, and teach, to refine how I work with you to be efficient, useful and, most importantly, memorable. I want you to carry what I've shown you into a bright future.
    
    I have a wife (a lovely Irish girl) and kids. I have lived and worked in many places (as Kiwis tend to do) – but most of my 14+ years of creating and teaching has had one overriding theme: bringing others along for the ride as we all try to change the world with our stories, our labours of love and our art.
    
    I'm a certified Adobe instructor (ACI) in Ireland. I'm also an Adobe Certified Expert (ACE) and have completed the Adobe Certified Associate training (ACA). And I don't just do Adobe. Remember, media is a very broad term – digital blew out the borders, so we are all constantly learning.
    
    I've been teaching for 14+ years. I come from being a media designer and content creator – so I understand exactly where you're at now. I've been there. I love this stuff. Print, digital publishing, web and video. I can see how it all connects. And I can see how we can share those connections.
    
    I built Bring Your Own Laptop in Ireland, New Zealand, Australia & online. I have a great team working with me to keep BYOL at the top of Adobe and digital media training. I understand business, I have one – so I know how important it is to get it right and make it work for you.
    
    Now my focus is on Udemy. It's my mission to bring you the best training for digital media on Udemy.
    
    Daniel Walter Scott`}, (err, raw) => {});
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