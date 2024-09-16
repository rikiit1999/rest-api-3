const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {        
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
};

const login = async (req, res) => {
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
            
            const token = jwt.sign({ id: checkUsername._id, role: checkUsername.role }, process.env.JWT_SECRET, { expiresIn: '1h' });            
            return res.status(200).json( {message: 'Đăng nhập thành công', token: token} );            
        }                
    }
    catch (error) {
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    };
};

// delete users
const deleteUsers = async (req, res) => {
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
};

// get list all of users by filter
const getAllUsers = async (req, res) => {
    try {
        //const result = await Employee.find(req.query);            
        //return res.status(200).json({message: 'Lấy ra danh sách người dùng (theo filter) thành công', result: result});
        const searchFields = {};

        if (req.query.fullname) {
            searchFields.fullname = req.query.fullname;
        }
        if (req.query.phoneNumber) {
            searchFields.phoneNumber = req.query.phoneNumber;
        }
        if (req.query.email) {
            searchFields.email = req.query.email;
        }
        if (req.query.username) {
            searchFields.username = req.query.username;
        }

        // let page = req.query.page;
        let page = parseInt( req.query.page );
        let pageSize = parseInt ( req.query.pageSize );
        let result;        
        
        const skip = (page - 1) * pageSize;         

        result = await Employee.find( searchFields ).sort( { 'createdAt': 1 } ).skip( skip ).limit( pageSize );
        
        result.forEach(item => {
            console.log(item.email);
            // use split
            console.log(item.email.split('@')[0]);

            let email = item.email.split('@')[0];
            item.email = email;
            console.log('new item.email:', item.email);
        });
        
        return res.status(200).json({message: 'Lấy ra danh sách người dùng (theo filter) thành công', result: result});

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
};

// Activate account (isActive: 0/1), default: 0
const activateAccount = async (req, res) => {
    try {
        const username = await Employee.findOne({ username: req.query.username }).exec();
        console.log('username: ', username);

        if (!username) {
            return res.status(404).json({message: 'Không tìm thấy user để kích hoạt', error: 'Not found'});
        }                

        const conditions = await Employee.findOne({ username: req.query.username }).exec();
        // const update = await Employee.updateOne(conditions, { isActive: !username.isActive });        
        const update = await Employee.updateOne(
            { username: req.query.username },  { isActive: !username.isActive }   
        );
        return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
};

// Change password
const changePassword = async (req, res) => {
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
};

// Update user in4
const updateUser = async (req, res) => {
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
        return res.status(200).json({message: 'Update thành công', result: result});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
};

// use the router and 401 anything falling through
const admin = async(req, res) => {
    res.sendStatus(401);
};

module.exports = { register, login, deleteUsers, getAllUsers, 
    activateAccount, changePassword, updateUser, admin };