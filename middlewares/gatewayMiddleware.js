require('dotenv').config();
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

const gatewayMiddleware = async (req, res, next) => {
    const token = req.header('x-auth-token');
    console.log('Token:', token);  

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);    
        console.log('JWT_SECRET: ', process.env.JWT_SECRET);    
        req.employee = decoded;
        console.log('Decoded:', decoded);  

        // const employee = await Employee.findById(req.employee.id);
        // if (!employee) return res.status(404).json({ msg: 'Employee not found' });

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const isAdmin = async (req, res, next) => {
    //const employee = req.employee; // Thông tin user đã được giải mã từ JWT
    console.log('req.employee: ', req.employee);        
    console.log('req.employee.role: ', req.employee.role);        
    if (req.employee.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only.' });
    }
    next();
};

const isUser = async (req, res, next) => {
    if (req.employee.role === 'admin') {
        return res.status(403).json({ message: 'Access denied, user only.' });
    }
    next();
};
  
module.exports = { gatewayMiddleware, isAdmin, isUser };