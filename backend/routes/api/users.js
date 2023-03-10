const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  check('firstName')
    .exists({ checkFalsy: true }),
  check('lastName')
    .exists({ checkFalsy: true }),
  handleValidationErrors
];

// Sign up - task 3
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;
    const user = await User.signup({ email, username, password, firstName, lastName });
    await setTokenCookie(res, user);
    return res.json({
      user,
    });
  }
);

// Get current User 
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.scope("currentUser").findByPk(req.params.id)
    console.log(user)
    if (!user) {
      next({
        status: 404,
        message: 'Could not find user',
        details: `User ${req.params.id} not found`,
      });
      return;
    }
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    return res.json({
      user,
      'XSRF-Token': csrfToken
    })
  } catch (err) {
    next({
      status: 404,
      message: `Could not find user ${req.params.id}`
    })
  }
});

module.exports = router;
