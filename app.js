
const express = require('express');

const morgan = require('morgan');

const app = express();

// morgan dev show status code, speed information
app.use(morgan('dev'));

// middleware: modify incoming request data otherwise req.body is going to be undefined
app.use(express.json());

// build own middleware
app.use((req, res, next) => {
    console.log('Hello from the middleware');
    // call next in each middleware
    next();
});

app.use((req, res, next) => {
    // add current time to the request
    req.requestTime = new Date().toISOString();
    next();
});






// app.get('/', (req, res) => {
//     res
//         .status(200)
//         .json({
//             message: 'Hello from the server side!',
//             app: 'Natours'
//         });
// });
//
// app.post('/', (req, res) => {
//    res.send('You can post to this endpoint...');
// });

// get all tours

// app.get('/api/v1/tours', getAllTours);
// get a tour with id
// app.get('/api/v1/tours/:id', getTour);

// create a tour
// app.post('/api/v1/tours', createTour);

// update a tour
// app.patch('/api/v1/tours/:id', updateTour);

// delete a tour
// app.delete('/api/v1/tours/:id', deleteTour);

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;