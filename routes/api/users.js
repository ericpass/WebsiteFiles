const express = require('express');
const router = express.Router();
const config = require('config');
const gravatar = require('gravatar');
// Documentation: https://www.npmjs.com/package/bcrypt
const bcrypt = require('bcryptjs');
// Documentation: https://www.npmjs.com/package/jsonwebtoken
const jwt = require('jsonwebtoken');
// Documentation: https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    // Use express-validator to validate that the request body matches expectations
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email')
      .isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
      .isLength({ min: 6})
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({email});

      if(user) {
        // This error is created as an array to be consistent with the error format from express-validator
        return res.status(400).json({ errors: [ { msg: 'User already exists' }] });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
