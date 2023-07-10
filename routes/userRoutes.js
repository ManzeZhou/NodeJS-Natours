const express = require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe
} = require('../controllers/userController');



const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');



const router = express.Router();

// route for user
router
    .post('/signup', authController.signup);

router
    .post('/login', authController.login);

router
    .get('/logout', authController.logout);

router
    .post('/forgotPassword', authController.forgotPassword);

router
    .patch('/resetPassword/:token', authController.resetPassword);

// auth required: protect all routes after this middleware
router.use(authController.protect);

router
    .patch('/updateMyPassword', authController.updatePassword);

router
    // limit upload only one file
    .patch('/updateMe', userController.uploadUserPhoto,updateMe);

router
    .delete('/deleteMe', deleteMe)

router.get('/me', userController.getMe, userController.getUser);

// admin only
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);



module.exports = router;
