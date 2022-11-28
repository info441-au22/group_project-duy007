import express from 'express';

var router = express.Router();

router.get("/", async (req, res, next) => {
    let filters = {}
    if (req.query.location) filters.location = req.query.location
    if (req.query.building)  filters.building = req.query.building
    if (req.query.room_number) filters.room_number = req.query.room_number
    if (req.query.time_open) filters.time_open = req.query.time_open
    if (req.query.time_close) filters.time_close = req.query.time_close
    if (req.query.charging) filters.charging = req.query.charging
    if (req.query.computer_access) filters.computer_access = req.query.computer_access
    if (req.query.reservation_required) filters.reservation_required = req.query.reservation_required
    if (req.query.private_space) filters.private_space = req.query.private_space
    try {
        let rooms = []
        if (Object.keys(filters).length > 0) {
            rooms = await req.models.Room.find(filters);
        } else {
            rooms = await req.models.Room.find();
        }
        res.json(rooms)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ "status": "error", "error": error.message });
    }
    
});

router.post("/", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        let roomObj = req.body;
        try {
            let newRoom = new req.models.Room({
                location: roomObj.location,
                builidng: roomObj.building,
                room_number: roomObj.room_number,
                sound_level: roomObj.sound_level,
                time_open: roomObj.time_open, 
                time_close: roomObj.time_close, 
                description: roomObj.description,
                charging: roomObj.charging,
                computer_access: roomObj.computer_access,
                reservation_required: roomObj.reservation_required,
                private_space: roomObj.private_space,
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