var express = require('express');
var router = express.Router();
var googlesheet = require("../googlesheet");

/**
 * sheet default route or index route
 */
router.get('/read', function(req, res, next) {
    googlesheet.read({},function (err, response) {
        if (err) {

        }
        return res.json({
            status: true,
            message: "Spread sheet data....",
            response: response
        });
    });
});

/**
 *
 * @type {Router|router}
 */

// TODO make it a post request.... for now it's get for testing with some default data.
router.get('/create', function(req, res, next) {
    googlesheet.create({},function (err, response) {
        if (err) {

        }
        return res.json({
            status: true,
            message: "successfully create or insert a record in a spreadsheet",
            response: response
        });
    });
});


/**
 *
 * @type {Router|router}
 */
// TODO make it a delete request.... for now it's get for testing with some default data.
router.get('/delete', function(req, res, next) {
    googlesheet.del({},function (err, response) {
        if(err){

        }
        return res.json({
            status: true,
            message: "successfully record deleted from the spread sheet",
            response: response.data
        });
    });
});
module.exports = router;
