const Router = require('express');
const login = require('../controllers/EmployeeController');

const employeeRouter = Router();

employeeRouter.get('/', login);

module.exports = employeeRouter;