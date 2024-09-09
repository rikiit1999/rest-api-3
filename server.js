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
app.delete('/api/delete-users', async (req, res) => {
    try {
        const { username } = req.query;
        const checkUsername = await Employee.find({ username });
 
        if (checkUsername.length == 0) {
            return res.status(404).json({message: 'Không tìm thấy username', error: 'Not found'});
        }
        else {
            const username = req.query.username;                                                                             
            
            const result = await Employee.deleteMany({ username: username });            

            return res.status(200).json({message: `Xóa thành công: ${result.deletedCount}/${checkUsername.length}`, result: result});
        }        
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// get list all of users by filter
app.get('/api/get-all-users', async (req, res) => {
    try {
        if (!req.query.fullname || !req.query.phoneNumber || !req.query.email || !req.query.username){
            const result = await Employee.find(req.query);
            console.log('alo 1');
            return res.status(200).json({message: 'Lấy ra danh sách người dùng (theo filter) thành công', result: result});            
        }
        console.log('alo 2');
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Activate account (isActive: 0/1), default: 0
app.patch('/api/activate', async (req, res) => {
    try {
        const username = await Employee.findOne({ username: req.query.username }).exec();
        console.log('username: ', username);

        if (!username) {
            return res.status(404).json({message: 'Không tìm thấy user để kích hoạt', error: 'Not found'});
        }                
        
        if (username.isActive == 1) {
            const conditions = await Employee.findOne({ username: req.query.username }).exec();
            const update = await Employee.updateOne(conditions, { isActive: 0 });            
            return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});            
        }

        const conditions = await Employee.findOne({ username: req.query.username }).exec();
        const update = await Employee.updateOne(conditions, { isActive: 1 });        
        return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Change password
app.patch('/api/change-password', async (req, res) => {
    try{
        const username = req.query.username;
        const checkUsername = await Employee.findOne({username: username}).exec();
        const password = req.body.password;

        // Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        if (!checkUsername) {
            return res.status(404).json({message: 'Không tìm thấy username', error: 'Not found'});
        }
        const conditions = checkUsername;
        const update = await Employee.updateOne(conditions, { password: hashedPassword });
        
        return res.status(200).json( {message: 'Update password thành công', result: update});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

// Update user in4
app.patch('/api/update-user', async (req, res) => {
    try {
        const usernameQuery = await Employee.findOne({ username: req.query.username }).exec();        

        if (!usernameQuery) {
            return res.status(404).json({message: 'Không tìm thấy user để update in4', error: 'Not found'});
        }

        const checkIsActive = usernameQuery.isActive;
        if (checkIsActive == 0) {
            return res.status(406).json({message: 'Tài khoản chưa được kích hoạt', error: 'Not Acceptable'});
        }

        const updateFields = {};
        
        if (req.body.fullname) {
            updateFields.fullname = req.body.fullname;
        }
        if (req.body.phoneNumber) {
            updateFields.phoneNumber = req.body.phoneNumber;
        }
        if (req.body.email) {
            updateFields.email = req.body.email;
        }
        if (req.body.username) {
            updateFields.username = req.body.username;
        }
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            updateFields.password = hashedPassword;
        }
                
        const result = await Employee.updateOne({ username: req.query.username }, updateFields);
        return res.status(200).json({message: 'Update thành công', password: result});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }


});

app.listen(port, () => {
    console.log(`Listening for requests on port: ${port}`);
});