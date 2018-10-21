const jwt = require('jsonwebtoken');

//Check authorization of a request
function checkAuth(req, res, next) {
    if(req.body.username === null || req.get('authorization') === undefined) return res.send({message: 'unauthorized'});
    let token = req.get('authorization').replace('Bearer ', '');
    jwt.verify(token, 'huydeptrai', (err, decoded) => {
        if (err) return res.send({message: 'unauthorized'});
        else {
            req.username = decoded.username;
            req.firstName = decoded.firstName;
            next();
        }
    });
};

module.exports = checkAuth;