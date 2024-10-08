const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    fullname: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
},{
    timestamps: true
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;