import express from 'express';
var router = express.Router();

import usersRouter from './controllers/users.js'
import roomsRouter from './controllers/rooms.js'

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.use('/users', usersRouter)
router.use('/rooms', roomsRouter)
export default router;