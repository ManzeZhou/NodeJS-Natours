const {promisify} = require('util');

const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');

const sendEmail = require('./../utils/email');

const crypto = require('crypto');

const signToken = id => {
    // secret key should be at least 32 characters
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // sending JWT token via cookies
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    // in production mode, hide jwt in the browser
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    // remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

// user sign up an account
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
    // const token = signToken(newUser._id);
    //
    // res.status(201).json({
    //     status: 'Success',
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });
});

// user sign in an account
exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password have content
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    // const user = User.findOne({email: email})
    // select password to make it shown
    const user = await User.findOne({email}).select('+password');

    // compare password when user email exists in db
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);

});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({status: 'success'});
};


// protect getAllTours only show tour lists when user sign in
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting token and check if it exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }


    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists: current user is removed from db but have token
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401))
    }

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }

    // grant access to protected route
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array of ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with this email address.', 404));
    }

    // 2) Generate the random rest token
    const resetToken = user.createPasswordRestToken();
    await user.save({validateBeforeSave: false});

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

});


exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt:Date.now()}});

    // convert time into local time
    // new Date(new Date().getTime()  - (new Date().getTimezoneOffset() * 60000))
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))}
    });
    // 2) if token has not expired and there is the user, set new password
    if (!user) {

        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {


    // 1) Verify token
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a Logged-in user
            res.locals.user = currentUser
            return next();
        } catch (err) {
            return next();
        }
    }

    next();


    // try {
    //     // 1) Verify token
    //     if (req.cookies.jwt) {
    //
    //         const decoded = await promisify(jwt.verify)(
    //             req.cookies.jwt,
    //             process.env.JWT_SECRET
    //         );
    //
    //         // 2) Check if user still exists
    //         const currentUser = await User.findById(decoded.id);
    //         if (!currentUser) {
    //             return next();
    //         }
    //
    //         // 3) Check if user changed password after the token was issued
    //         if (currentUser.changedPasswordAfter(decoded.iat)) {
    //             return next();
    //         }
    //
    //         // There is a Logged-in user
    //         res.locals.user = currentUser
    //         return next();
    //     }
    // } catch (e) {
    //     return next();
    // }
    //  next();
};


