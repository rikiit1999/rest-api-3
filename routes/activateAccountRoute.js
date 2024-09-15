const express = require('express');
const router = express();
const Employee = require('../models/Employee');

router.patch('/', async (req, res) => {
    try {
        const username = await Employee.findOne({ username: req.query.username }).exec();
        console.log('username: ', username);

        if (!username) {
            return res.status(404).json({message: 'Không tìm thấy user để kích hoạt', error: 'Not found'});
        }                
        
        // if (username.isActive == 1) {
        //     const conditions = await Employee.findOne({ username: req.query.username }).exec();
        //     const update = await Employee.updateOne(conditions, { isActive: 0 });            
        //     return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});            
        // }

        const conditions = await Employee.findOne({ username: req.query.username }).exec();
        const update = await Employee.updateOne(conditions, { isActive: !username.isActive });        
        return res.status(200).json({message: 'Thay đổi isActive thành công', result: update});           
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error, message: 'Có lỗi xảy ra'});
    }
});

module.exports = router;