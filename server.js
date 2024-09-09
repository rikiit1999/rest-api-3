require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT;
const con = process.env.CONNECTION;

const app = express();

const Employee = require('./models/Employee');
const bcrypt = require('bcryptjs');

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
app.post('/api/register', async (req, res) => {        
    try {
        const { fullname, phoneNumber, email, username, password } = req.body;

        // Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!fullname || !phoneNumber || !email || !username  || !password ) {
            return res.status(404).json({message: 'Vui lòng điền đẩy đủ thông tin', error: 'Not found'});
        }

        const checkUsername = await Employee.findOne({ username });
        if (checkUsername) {
            return res.status(200).json({message: 'username đã tồn tại'});
        }
        else {
            //const result = await Employee.create(req.body);          
            const result = await Employee.create({fullname, phoneNumber, email, username, password: hashedPassword});          
        
            return res.status(200).json({message: 'Đăng ký thành công', result: result}); 
        }                   
    }
    catch (error) {
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    };
});

// login
app.get('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username && !password) {
            return res.status(404).json({message: 'Vui lòng điền đẩy đủ thông tin', error: 'Not found'});
        }    
        else {
            const checkUsername = await Employee.findOne({ username });
            if (!checkUsername) return res.status(404).json({message: 'thất bại', error: 'sai thông tin'});

            const checkPassword = await bcrypt.compare(password, checkUsername.password);

            if (!checkPassword) return res.status(404).json({message: 'thất bại', error: 'sai thông tin pass'});
            
            return res.status(200).json( {message: 'Đăng nhập thành công'} );            
        }                
    }
    catch (error) {
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    };
});

// delete users
app.delete('/api/delete', async (req, res) => {
    try {
        const { username } = req.query;
        const checkUsername = await Employee.find({ username });
 
        if (checkUsername.length == 0) {
            return res.status(404).json({message: 'Không tìm thấy username', error: 'Not found'});
        }
        else {
            const username = req.query.username;                                                     
            
            const count = await Employee.countDocuments({ username: { $exists: true } });
            
            const result = await Employee.deleteMany({ username: username });            

            return res.status(200).json({message: `Xóa thành công: ${result.deletedCount}/${count}`, result: result});
        }        
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

app.listen(port, () => {
    console.log(`Listening for requests on port: ${port}`);
});