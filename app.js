const express = require('express');
const morgan = require('morgan');
// limit request rate
const rateLimit = require('express-rate-limit');
// set security http headers
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// preventing params pollution
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouters = require('./routes/viewRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bookingRouter = require('./routes/bookingRoutes');



const app = express();


// Server-side Rendering with Pug Templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));




// 1) GLOBAL MIDDLEWARES
// set serving static file by using middlewares for overview.html, set public folder as static, only use url:http://127.0.0.1:3000/overview.html
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// only use morgan in development environment
console.log(process.env.NODE_ENV);
// Set Security HTTP headers
app.use(
    helmet()
);




app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
                baseUri: ["'self'"],
                fontSrc: ["'self'", 'https:', 'data:'],
                scriptSrc: [
                    "'self'",
                    'https:',
                    'http:',
                    'blob:',
                    'https://*.mapbox.com',
                    'https://js.stripe.com',
                    'https://m.stripe.network',
                    'https://*.cloudflare.com',
                ],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ["'none'"],
                styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                workerSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                    'https://m.stripe.network',
                ],
                childSrc: ["'self'", 'blob:'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                formAction: ["'self'"],
                connectSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'data:',
                    'blob:',
                    'https://*.stripe.com',
                    'https://*.mapbox.com',
                    'https://*.cloudflare.com/',
                    'https://bundle.js:*',
                    'ws://127.0.0.1:*/',

                ],
                upgradeInsecureRequests: [],
            },
        },
    })
);

app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));


app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
);



// dev login
if (process.env.NODE_ENV === 'development') {
  // morgan dev show status code, speed information
  app.use(morgan('dev'));
};

const limiter = rateLimit({
  // 100 request from same IP in 1 hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,  please try again in an hour!'
});

app.use('/api', limiter);




// middleware: modify incoming request data otherwise req.body is going to be undefined
app.use(express.json({ limit: '10kb' }));
// parse data from url response
app.use(express.urlencoded({ extended: true, limit: '10kb'}));
// parser data from cookie
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// filter out all $ and .
app.use(mongoSanitize());
// Data sanitization against XSS: malicious HTML code
app.use(xss());

// prevent parameter pollution: duplicate fields
// can create white list for the fields duplicated: duration=9&duration=8
app.use(hpp({
  whitelist: [
      'duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// build own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   // call next in each middleware
//   next();
// });

app.use(compression());

// test middleware
app.use((req, res, next) => {
  // add current time to the request
  req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
  // console.log(req.headers);
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

// 3) Routes
app.use('/', viewRouters);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// manage unhanding routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // create an error to test error middleware
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // whatever passed into next, it is going to be an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;

// package:
// "devDependencies": {
//   "eslint": "^8.36.0",
//       "eslint-config-airbnb": "^19.0.4",
//       "eslint-config-prettier": "^8.7.0",
//       "eslint-plugin-import": "^2.27.5",
//       "eslint-plugin-jsx-a11y": "^6.7.1",
//       "eslint-plugin-node": "^11.1.0",
//       "eslint-plugin-prettier": "^4.2.1",
//       "eslint-plugin-react": "^7.32.2",
//       "prettier": "2.8.4"
// },
