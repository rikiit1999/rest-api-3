require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT;
const con = process.env.CONNECTION;

const app = express();

const registerRoute = require('./routes/registerRoute');
const loginRoute = require('./routes/loginRoute');
const deleteUsersRoute = require('./routes/deleteUsersRoute');
const getAllUsersRoute = require('./routes/getAllUsersRoute');
const activateAccountRoute = require('./routes/activateAccountRoute');
const changePasswordRoute = require('./routes/changePasswordRoute');
const updateUserRoute = require('./routes/updateUserRoute');

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

// register
app.use('/api/register', registerRoute);

// login
app.use('/api/login', loginRoute);

// delete users
app.use('/api/delete-users', deleteUsersRoute);

// get list all of users by filter
app.use('/api/get-all-users', getAllUsersRoute);

// let testString = 'riki.it.att@gmail.com';
// cut string

// Activate account (isActive: 0/1), default: 0
app.use('/api/activate', activateAccountRoute);

// Change password
app.use('/api/change-password', changePasswordRoute);

// Update user in4
app.use('/api/update-user', updateUserRoute);

app.listen(port, () => {
    console.log(`Listening for requests on port: ${port}`);
});