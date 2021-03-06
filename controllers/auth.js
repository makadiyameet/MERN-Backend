const User = require("../models/user");
const { check , validationResult} = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');


exports.signup =  (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }

    const user = new User(req.body);
    user.save((err, user) => {
        if(err){
            return res.status(400).json({
                error : "NOT able to save user to DB"
            });
        }
        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        });
    })
};

exports.signin = (req, res) => {
    const {email, password} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }

    User.findOne({email}, (err, user) => {
        if(err ) {
            return res.status(400).json({
                error: "USER email does not exists"
            })
        }

        if(!user) {
            return res.status(400).json({
                error: "USER is does not exists"
            })
        }

        if(!user.autheticate(password)){
            return res.status(401).json({
                error: "Email and password not match"
            })
        }

        // create token
        const token = jwt.sign({_id: user._id}, process.env.SECRET);
        //put tocken into cookie
        res.cookie("token", token, {expire: new Date() + 9999});

        //send response to front end
        const {_id, name, email, role} = user;
        return res.json({token, user: {_id, name, email, role}})

    })
}

exports.signout =  (req, res) => {
    
    res.clearCookie("token");
    res.json({
        message: "User signout successfully"
    });
};


//protected routes //it is middle ware comming from express so do not require to add next()
//this is responsible for passing token to backend
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
});


//custom middlewares
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        });
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "You are not ADMIN, Accesss denied"
        })
    }
    next();
}
