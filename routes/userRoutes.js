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
    .post('/forgotPassword', authController.forgotPassword);

router
    .patch('/resetPassword/:token', authController.resetPassword);

router
    .patch('/updateMyPassword', authController.protect, authController.updatePassword);

router
    .patch('/updateMe', authController.protect, updateMe);

router
    .delete('/deleteMe', authController.protect, deleteMe)

router.get('/me', authController.protect, userController.getMe, userController.getUser);

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
