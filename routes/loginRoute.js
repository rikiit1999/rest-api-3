const express = require('express');
const Employee = require('../models/Employee');
const router = express();
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
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

module.exports = router;