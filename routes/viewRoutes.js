const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

// router.get('/', (req, res) => {
//     // render pug template
//     res.status(200).render('base', {
//         // import data into pug template: locals in pug file
//         tour: 'The Forest Hiker',
//         user: 'Jonas'
//     });
// });

router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTour);

module.exports = router;