const express = require('express');
const router = express();
const Employee = require('../models/Employee');

router.get('/', async (req, res) => {
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
});

module.exports = router;