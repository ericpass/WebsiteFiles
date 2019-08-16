const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const config = require('config');
// Documentation: https://www.npmjs.com/package/jsonwebtoken
const jwt = require('jsonwebtoken');
// Documentation: https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');


// @route  GET api/auth
// @desc   Return user info with valid JWT
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post('/', [
    // Use express-validator to validate that the request body matches expectations
    check('email', 'Please include a valid email')
      .isEmail(),
    check('password', 'Password is required')
      .exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({email});

      if(!user) {
        // This error is created as an array to be consistent with the error format from express-validator
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return JWT
      const payload = {
        user: {
          id: user.id
        }
      }

      // Sign the token and set the expiration (3600 is an hour)
      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch(err) {
      console.error('err.message');
      res.status(500).send('Server error');
    }
});


module.exports = router;
