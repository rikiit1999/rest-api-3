const Router = require('express');
const employeeRouter = require('./employeeRoute');

const router = Router();

router.use("/api", employeeRouter);

module.exports = router;