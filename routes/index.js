const Router = require('express');
const router = Router();

const registerRouter = require('./registerRoute');
const loginRouter = require('./loginRoute');
const deleteUsersRouter = require('./deleteUsersRoute');
const getAllUsersRouter = require('./getAllUsersRoute');
const activateAccountRouter = require('./activateAccountRoute');
const changePasswordRouter = require('./changePasswordRoute');
const updateUserRouter = require('./updateUserRoute');

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/delete-users", deleteUsersRouter);
// get list all of users by filter
router.use("/get-all-users", getAllUsersRouter);
// Activate account (isActive: 0/1), default: 0
router.use("/activate", activateAccountRouter);
router.use("/change-password", changePasswordRouter);
router.use("/update-user", updateUserRouter);

module.exports = router;