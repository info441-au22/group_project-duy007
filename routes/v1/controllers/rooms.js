import express from 'express';
import stringToTime from '../utils/stringToTime.js';

var router = express.Router();

router.get("/", async (req, res, next) => {
    let filters = {}
    if (req.query.location) filters.location = req.query.location
    if (req.query.building)  filters.building = req.query.building
    if (req.query.sound_level)  filters.sound_level = req.query.sound_level
    if (req.query.room_number) filters.room_number = req.query.room_number
    if (req.query.time_open) filters.time_open = {$gte: parseInt(req.query.time_open)}
    if (req.query.time_close) filters.time_close = {$lte: parseInt(req.query.time_close)}
    if (req.query.charging) filters.charging = req.query.charging
    if (req.query.computer_access) filters.computer_access = req.query.computer_access
    if (req.query.reservation_required) filters.reservation_required = req.query.reservation_required
    if (req.query.private_space) filters.private_space = req.query.private_space
    console.log(filters)
    try {
        let rooms = await req.models.Room.find(filters);
        console.log(rooms)
        res.json(rooms)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ "status": "error", "error": error.message });
    }
    
});

router.post("/", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        let roomObj = req.body;
        const { image } = req.files;
        image.mv(`./public/imgs/${image.name}`);
        try {
            let newRoom = new req.models.Room({
                image: `imgs/${image.name}`,
                location: roomObj.input_location,
                building: roomObj.input_building,
                room_number: roomObj.input_room_number,
                sound_level: roomObj.input_sound_level,
                time_open: stringToTime(roomObj.input_time_open), 
                time_close: stringToTime(roomObj.input_time_close), 
                description: roomObj.input_description,
                charging: (roomObj.input_charging === "on"),
                computer_access: (roomObj.input_computer_access === "on"),
                reservation_required: (roomObj.input_reservation_required === "on"),
                private_space: (roomObj.input_private_space === "on"),
                modified_date: Date.now()
            });
            await newRoom.save();
            res.json({ "status": "success" });
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ "status": "error", "error": error.message });
        }
    } else {
        res.status(401)
        res.json({
            status: "error",
            error: "not logged in"
         })
    }
});


router.post("/like", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        try {
            let ref_room = await req.models.Room.findById(req.body.roomID);
            if (!ref_room.likes.includes(req.session.account.username)) {
                ref_room.likes.push(req.session.account.username)
            }
            await ref_room.save()
            res.json( {"status": "success"})
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ "status": "error", "error": error.message });        
        }
    } else {
        res.status(401)
        res.json({
            status: "error",
            error: "not logged in"
         })
    }
})

router.post("/unlike", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        try {
            let ref_room = await req.models.Room.findById(req.body.roomID);
            if (ref_room.likes.includes(req.session.account.username)) {
                ref_room.likes.pull(req.session.account.username)
            }
            await ref_room.save()
            res.json( {"status": "success"})
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ "status": "error", "error": error.message });        
        }
    } else {
        res.status(401)
        res.json({
            status: "error",
            error: "not logged in"
         })
    }
})

export default router;