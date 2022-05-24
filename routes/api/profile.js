// importing modules
const express = require('express');
const request = require('request');
const config = require('config');
const {check, validationResult} = require('express-validator');

// importing models
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');
const Post = require('../../Models/Post')

// importing middlewares
const auth = require('../../middleware/auth');

// defining router
const router = express.Router();

// @route   GET api/profile
// @desc    Test route
// @access  Public



// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post('/', [auth,[ check('status', 'Status is required').not().isEmpty(),
                          check('skills', 'Skills are required').not().isEmpty()
                        ]
                 ],
                 async (req, res) => {

                    const errors = validationResult(req);
                    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

                    const {
                        company,
                        website,
                        location,
                        bio,
                        status,
                        githubusername,
                        skills,
                        youtube,
                        facebook,
                        twitter,
                        instagram,
                        linkedin
                    } = req.body;

                    // Building profile object
                    const profileFields = {};
                    profileFields.user = req.user.id;
                    if(company) profileFields.company = company;
                    if(website) profileFields.website = website;
                    if(location) profileFields.location = location;
                    if(bio) profileFields.bio = bio;
                    if(status) profileFields.status = status;
                    if(githubusername) profileFields.githubusername = githubusername;
                    if(skills) profileFields.skills = skills.split(',').map(skill => skill.trim());
                    
                    // Building social object
                    profileFields.social = {};
                    if(youtube) profileFields.social.youtube = youtube;
                    if(twitter) profileFields.social.twitter = twitter;
                    if(facebook) profileFields.social.facebook = facebook;
                    if(linkedin) profileFields.social.linkedin = linkedin;
                    if(instagram) profileFields.social.instagram = instagram;
                    
                    try {
                        let profile = await Profile.findOne({ user: req.user.id });

                        if(profile) {
                            // Updating the profile
                            profile = await Profile.findOneAndUpdate(
                                {user: req.user.id},
                                {$set: profileFields},
                                {new: true}
                            );

                            return res.json(profile);
                        }

                        // Creating the profile
                        profile = new Profile(profileFields);
                        await profile.save();
                        res.json(profile)

                    } catch(err) {
                        console.error(err.message);
                        res.status(500).send('Server Error');
                    }
                }
);

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']); // searching profile by ID

        if(!profile) return res.status(400).json({ msg: 'There is no such profile for this user' }); // returning if profile not found

        res.json(profile); // returning profile

    } catch(err) {
        
        console.error(err.message); // logging error
        
        res.status(500).send('Server Error'); // giving response of server error

    }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {

        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        res.json(profiles);

    } catch (err) {

        console.error(err.message);

        res.status(500).send('Server Error in searching all profiles');

    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        
        if(!profile) return res.status(400).json({ msg: 'Profile not found' });
        
        res.json(profile);
    } catch (err) {

        console.error(err);

        if(err.kind == 'ObjectId') return res.status(400).json({ msg: 'Profile not found' });
        
        res.status(500).send('Server Error in searching profile');

    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        
        await Post.deleteMany({user: req.user.id})

        await Profile.findOneAndRemove({ user: req.user.id }); // Removing profile

        await User.findOneAndRemove({ _id: req.user.id }); // Removing user

        res.json({ msg: 'User removed' });

    } catch (err) {

        console.error(err.message);

        res.status(500).send('Server Error in searching all profiles');

    }
});

// @route   PUT api/profile/experience
// @desc    Add experience
// @access  Private
router.put(

    '/experience',
    
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
        ] 
    ],

    async (req, res) => {

        const errors = validationResult(req);

        if(!errors) return res.status(400).json({ errors: errors.array() });

        const {

            title,
            
            company,
            
            location,
            
            from,
            
            to,
            
            current,
            
            description
            
        } = req.body;

        const newExp = {
            
            title,
            
            company,
            
            location,
            
            from,
            
            to,
            
            current,
            
            description

        }

        try {

            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);
            
            await profile.save();
            
            res.json(profile);

        } catch (err) {

            console.log(err.message);

            res.status(500).send('Server Error');

        }
    }
);


// @route   PUT api/profile/experience/:exp_id
// @desc    Delete experience
// @access  Private
router.delete(
    
    '/experience/:exp_id',
    
    auth,
    
    async (req, res) => {
        
        try {
            
            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id); // Getting index to be remove

            profile.experience.splice(removeIndex, 1);

            await profile.save();

            res.json(profile);

        } catch (err) {

            console.log(err.message);

            res.status(500).send('Server Error');

        }
    }
);

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
    
    '/education',
    
    [
        auth,
        
        [
            check('school', 'School Name is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
        ]
    ],
    
    async (req, res) => {

        const errors = validationResult(req);

        if(!errors) return res.status(400).json({ errors: errors.array() });

        const {

            school,

            degree,
            
            fieldofstudy,
            
            from,
            
            to,
            
            current,
            
            description

        } = req.body;

        const newEdu = {

            school,

            degree,

            fieldofstudy,

            from,

            to,

            current,

            description

        }

        try {

            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);

        } catch (err) {

            console.log(err.message);

            res.status(500).send('Server Error');

        }
    }
);


// @route   PUT api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
    
    '/education/:edu_id',
    
    auth,
    
    async (req, res) => {

        try {

            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id); // Getting index to be remove

            profile.education.splice(removeIndex, 1);

            await profile.save();

            res.json(profile);

        } catch (err) {

            console.log(err.message);

            res.status(500).send('Server Error');

        }
    }
);

// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get(
    
    '/github/:username',
    
    (req, res) => {

        try {

            const options = {

                uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                
                method: 'GET',
                
                headers: { 'user-agent': 'node.js' }

            };

            request(options, (error, response, body) => {

                if (error) console.error(error);

                if(response.statusCode !== 200) return res.status(404).json({ msg: 'No github profile found' });

                res.json(JSON.parse(body));

            });
        } catch (err) {

            console.log(err.message);

            res.status(500).send("Server Error");

        }
    }
);

module.exports = router;
