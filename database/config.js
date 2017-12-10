//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB;
if (process.env.ENV === undefined || process.env.ENV === 'dev') {
    mongoDB = 'mongodb://127.0.0.1/authmega';
}else {
    mongoDB = 'mongodb://%%Production DB IP%%/my_database';
}

mongoose.connect(mongoDB, {
    useMongoClient: true
}, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + mongoDB + ' => ' + err);
    } else {
        console.log ('Succeeded connected to: ' + mongoDB);
    }
});

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;