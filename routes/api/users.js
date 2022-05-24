// importing modules
const express = require('express');
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// importing models
const User = require('../../Models/User');

// defining router
const router = express.Router();

// @route   GET api/users
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('User Route')); // defining users route


// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(), // checking required fields
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter the password with minimum 6 characters').isLength({min: 6})
    ],
    async (req, res) => {
        console.log("checkStagePassed", req.body)
        const errors = validationResult(req); // checking errors

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }) // return if errors found
        };

        const {name, email, password}= req.body; // destructuring fields from object

        try{

            let user = await User.findOne({ email }); // Checking if user exits in database

            if (user) {

                return res.status(400).json({ errors: [{ msg: 'User already exists' }] }); // return if user already exits
            }

            const avatar = gravatar.url(email, { 
                s: '200',
                r: 'pg',
                d: 'mm'
            }); // Getting user gravatar

            user = new User({ 
                name,
                email,
                avatar,
                password
            }); // creating new user
     
            const salt = await bcrypt.genSalt(10); // Encrypting the password

            user.password = await bcrypt.hash(password, salt);

            await user.save(); // saving the user
    
            const payload = {
                user: {
                    id: user.id
                }
            } // Returning jsonwebtoken

            jwt.sign(

                payload,

                config.get('jwtSecret'),

                { expiresIn: 360000 },

                (err, token) => {

                    if(err) throw err;

                    res.json({ token });

                }
            );

            
        } catch(err) {

            console.log(err.message);

            res.status(500).send('Server Error bro');

        }

    }
);

module.exports = router; // exporting users router module
