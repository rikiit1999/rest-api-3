const Router = require('express');
const { register, login, deleteUsers, getAllUsers, 
    activateAccount, changePassword, updateUser, admin } = require('../controllers/EmployeeController');

const employeeRouter = Router();

const { gatewayMiddleware, isAdmin, isUser } = require('../middlewares/gatewayMiddleware');

employeeRouter.post('/register', register);
employeeRouter.get('/login', login);
employeeRouter.delete('/delete-users', gatewayMiddleware, isAdmin, deleteUsers);
employeeRouter.get('/get-all-users', gatewayMiddleware, isAdmin, getAllUsers);
employeeRouter.patch('/activate', gatewayMiddleware, isAdmin, activateAccount);
employeeRouter.patch('/change-password', gatewayMiddleware, isUser, changePassword);
employeeRouter.patch('/update-user', gatewayMiddleware, isUser, updateUser);
employeeRouter.get('/admin', admin);

module.exports = employeeRouter;