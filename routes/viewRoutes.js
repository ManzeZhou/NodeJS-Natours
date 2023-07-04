const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.get('/', (req, res) => {
//     // render pug template
//     res.status(200).render('base', {
//         // import data into pug template: locals in pug file
//         tour: 'The Forest Hiker',
//         user: 'Jonas'
//     });
// });

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForm);

module.exports = router;