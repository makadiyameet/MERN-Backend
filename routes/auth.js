var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");


// For validation link is [https://express-validator.github.io/docs/custom-error-messages.html]

router.post("/signup",[
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is require").isEmail(),
    check("password", "password should be atleast 3 char").isLength({ min: 3 }),
], signup);

router.post("/signin",[
    check("email", "email is require").isEmail(),
    check("password", "password field is required").isLength({ min: 1 }),
], signin);


router.get("/signout", signout);

// router.get("/testroute", isSignedIn, (req, res) => {
//     // res.send("A protected route")
//     res.json(req.auth)
// });

module.exports = router;