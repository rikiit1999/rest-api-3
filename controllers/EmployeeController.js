const Employee = require('../models/Employee');

export const register = async (req, res) => {        
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