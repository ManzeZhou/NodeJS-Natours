const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    // can have many validation errors in an object
    const errors = Object.values(err.errors).map((el) => el.message);
    // combine messages together
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again!', 401);


const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });


};


const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {

        // operational trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // Programming or other unknown error: don't leak error details
        console.error('ERROR', err);
        return res.status(500).json({
            status: 'err',
            message: 'Something went very wrong',
        });

    }
    // RENDERED WEBSITE
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
        // Programming or other unknown error: don't leak error details
        console.error('ERROR', err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later.'
        })

};

module.exports = (err, req, res, next) => {
    // show stack track
    // console.log('err--->', err.stack);
    // define different error status and message
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'development') {
        console.log('development');
        sendErrorDev(err, req, res);
    } else {
        let error = {...err};
        error.message = err.message;
        // 1) get a tour with non exist id from db error
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        // 2) create a tour with an existed name
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        // 3) update a tour with rating more than 5/ difficulty input that are not allowed: validationError
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        // 4) if login with invalid token
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        // 5) if login with an expired token
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }
    // else if (process.env.NODE_ENV === 'production') {
    //   console.log(' you  are  in production');
    //  update a tour with rating more than 5, get a tour with non exist id, create a tour with an existed name: DB Error
    //   let error = { ...err };
    // 1) get a tour with non exist id
    //   if (error.name === 'CastError') error = handleCastErrorDB(error);
    //
    //   sendErrorProd(error, res);
    // }
};
