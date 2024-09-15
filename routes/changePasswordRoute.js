const express = require('express');
const router = express();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

router.patch('/', async (req, res) => {
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

module.exports = router;