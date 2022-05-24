// importing modules
const express = require('express');
const {check, validationResult} = require('express-validator');
const { jar } = require('request');
const auth = require('../../middleware/auth');

// importing models
const Post = require('../../Models/Post');
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');

// defining router
const router = express.Router();

// @route   GET api/posts
// @desc    Test route
// @access  Public
// router.get('/', (req, res) => res.send('Post Route')); // defining posts route

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty() // checking the requirements
        ]
    ],

    async (req, res) => {
        
        const errors = validationResult(req); // checking errors
        
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // return if errors found

        const user = await User.findById(req.user.id).select('-password');

        try {
            const newPost = new Post ({

                text: req.body.text,

                name: user.name,

                avatar: user.avatar,

                user: req.user.id

            });
            
            const post = await newPost.save();

            res.json(post);

        } catch (err) {

            console.error(err.message);

            res.status(500).send('Server Error');

        }
    }

);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {

    try {

        const posts = await Post.find().sort({ date: -1 });
        
        res.json(posts);  

    } catch (err) {

        console.error(error.message);

        res.status(500).send('Server Error');
        
    }

});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);
        
        if(!post) return res.status(404).json({ msg: 'Post not found' });

        res.json(post);     

    } catch (err) {

        console.error(err.message);
        
        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });

        res.status(500).send('Server Error');

    }

});

// @route   DELETE api/posts/:id
// @desc    Delete a post by id
// @access  Private
router.delete('/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if(!post) return res.status(404).json({ msg: 'Post not found' });
        
        if(post.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorised to delete this post' }); // checking the authorised user

        await post.remove();

        res.json({msg: 'Post has been removed.'});    

    } catch (err) {

        console.error(err.message);

        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });

        res.status(500).send('Server Error');

    }

});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0) {

            return res.status(400).json({ msg: 'Post already liked' }); // return if already liked

        } // Checking if the post has already been liked by the user

        post.likes.unshift({ user: req.user.id }); // adding like

        await post.save();

        res.json(post.likes);
        
    } catch (err) {

        console.error(err.message);

        res.status(500).send("Server Error");

    }

});

// @route   PUT api/posts/unlike/:id
// @desc    unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length===0) {

            return res.status(400).json({ msg: 'Post has not been liked' }); // return if not liked

        } // Checking if the post has already been liked by the user

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id); // Getting index of like to be removed

        post.likes.splice(removeIndex, 1);  // removing like

        await post.save();

        res.json(post.likes);
        
    } catch (err) {

        console.error(err.message);

        res.status(500).send("Server Error");

    }

});

// @route  POST api/posts/comment/:id
// @desc   Add comment
// @access Private
router.post(

    '/comment/:id',

    [
        auth,

        [
            check('text', 'Text is required').not().isEmpty() // checking the requirements
        ]

    ],

    async (req, res) => {

        const errors = validationResult(req); // checking errors
        
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // return if errors found

        const user = await User.findById(req.user.id).select('-password');

        const post = await Post.findById(req.params.id);

        try {

            const newComment = {

                text: req.body.text,

                name: user.name,

                avatar: user.avatar,

                user: req.user.id

            };
            
            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);

        } catch (err) {

            console.error(err.message);
            
            res.status(500).send('Server Error');

        }
    }

);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.comment_id); // Pulling out comment

        if(!comment) return res.status(404).json({ msg: 'Comment not found' }); // Making sure comment exits
        
        if(comment.user.toString() !== req.user.id) {

            return res.status(401).json({ msg: 'User not authorised to delete this comment' }); // return if not authorised

        } // checking the authorised user

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id); // Getting index of comment to be removed

        post.comments.splice(removeIndex, 1);  // removing like

        await post.save();

        res.json(post.comments);

    } catch (err) {

        console.error(err.message);

        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });

        res.status(500).send('Server Error');

        }
        
});

module.exports = router;
