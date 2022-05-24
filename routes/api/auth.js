const express = require('express'); 
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../Models/User');

const router = express.Router(); // defining router

// @route   GET api/auth
// @desc    Authenticate user
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // finding user from database
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error bro');
    }
}); 

// @route   POST api/auth
// @desc    Login user
// @access  Private
router.post(
    '/',
    [       
        check('email', 'Please include a valid email').isEmail(), // checking required input fields
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        };
        const {email, password}= req.body; // destructuring required input fields

        try{

            // Checking if user exits
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }
            
            
            // Matching the password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }
    
            // Returning jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {

                    if(err) throw err;
                    res.json({ token });
                }
            )

        } catch(err) {
            console.log(err.message);
            res.status(500).send('Server Error bro')
        }
    }
);

module.exports = router; // exporting auth router module
