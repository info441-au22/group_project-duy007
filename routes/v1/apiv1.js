import express from 'express';
var router = express.Router();

import usersRouter from './controllers/users.js'

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.use('/users', usersRouter)

export default router;