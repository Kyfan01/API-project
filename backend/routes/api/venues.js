const express = require('express')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();




module.exports = router;
