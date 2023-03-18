const fs = require("fs");


// read tours data file at the beginning: block event loop
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
};

// define a variable id for tours
// question mark ? for params mean do not need to have it, its optional
exports.getTour = (req, res) => {
    // send back all the tours
    console.log('req.params',req.params);

    // id comes from tours' id, find the id from request
    // trans string into number
    const id = req.params.id * 1
    // if tour id does not exist
    // Solution 1:
    // if(id > tours.length) {
    //     return res.status(404).json({
    //         status: 'failed',
    //         message: 'Invalid ID'
    //     })
    // }
    const tour = tours.find(el => el.id === id);

    // Solution 2: if didn't find match tour
    if(!tour) {
        return res.status(404).json({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
        // result: tours.length,
        // data: {
        //     tours
        //     //tours: tours
        // }
    });
}

exports.createTour = (req, res) => {
    // use postman to post a request with body like this: {
    //     "name": "Test Tour",
    //     "duration": 10,
    //     "difficulty": "easy"
    // }
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1;
    // Object.assign combine two objects together
    const newTour = Object.assign({id: newId}, req.body);
    tours.push(newTour);

    // add new tour into the file and show it on the page
    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        err => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour
                }
            })
        });
}

// patch request to update data
exports.updateTour = (req, res) => {
    const id = req.params.id * 1;

    if(id > tours.length) {
        return res.status(404).json({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here ...>'
        }
    })
}

// delete request
exports.deleteTour = (req, res) => {
    const id = req.params.id * 1;

    if(id > tours.length) {
        return res.status(404).json({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
};