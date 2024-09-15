require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT;
const con = process.env.CONNECTION;

const app = express();

const router = require('./routes/index');

try {
    mongoose.connect(con);    
    console.log('Connected!');
} 
catch (error) {
    handleError(error);
    console.log('Error: ', error);
}

app.use(express.json());

app.get('/', (req, res) => {
    res.send('GET request to the homepage');    
});

app.use('/', router);

// let testString = 'riki.it.att@gmail.com';
// cut string

app.listen(port, () => {
    console.log(`Listening for requests on port: ${port}`);
});