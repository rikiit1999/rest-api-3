const express = require('express');
const router = express();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

router.patch('/', async (req, res) => {
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
});

module.exports = router;