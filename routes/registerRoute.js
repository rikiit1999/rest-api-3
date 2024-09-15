const Router = require('express');
const register = require('../controllers/EmployeeController');

const employeeRouter = Router();

employeeRouter.post('/', register);

module.exports = employeeRouter;