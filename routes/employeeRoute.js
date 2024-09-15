const Router = require('express');
const { register, login, deleteUsers, getAllUsers, 
    activateAccount, changePassword, updateUser } = require('../controllers/EmployeeController');

const employeeRouter = Router();

employeeRouter.post('/register', register);
employeeRouter.get('/login', login);
employeeRouter.delete('/delete-users', deleteUsers);
employeeRouter.get('/get-all-users', getAllUsers);
employeeRouter.patch('/activate', activateAccount);
employeeRouter.patch('/change-password', changePassword);
employeeRouter.patch('/update-user', updateUser);

module.exports = employeeRouter;