const express = require('express');
const router = express();
const Employee = require('../models/Employee');

router.delete('/', async (req, res) => {
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

module.exports = router;