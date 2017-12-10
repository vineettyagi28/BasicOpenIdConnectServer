var express = require('express');
var router = express.Router();
const User = require('../models/user');
const DB = require('../database/config');
const bodyParser = require('body-parser');

const parse = bodyParser.json();

router.post('/', parse, async (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log("Received User with name : " + name );

    try {
        var user = await User.create({
            name: name,
            email: email,
            password: password,
            emailVerified: false
        });

        console.log(user);
        user.password = '';
        res.send(user);
    }catch (err){
        console.log("Error : " + err);
        res.send(err);
    }
});

module.exports = router;