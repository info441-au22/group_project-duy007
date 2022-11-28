import mongoose from 'mongoose';

let models = {};
main();
async function main() {
    console.log("Connect to mongoDB");
    await mongoose.connect("mongodb+srv://info441:info441@cluster0.nbsx4fd.mongodb.net/studyRoom?retryWrites=true&w=majority");
    const roomSchema = new mongoose.Schema({
        location: String, 
        building: String, 
        room_number: String,
        sound_level: String,
        time_open: String, 
        time_close: String, 
        description: String,
        charging: Boolean,
        computer_access: Boolean,
        private_space: Boolean,
        reservation_required: Boolean, 
        likes: [String],
        modified_date: Date
    });
    models.Room = mongoose.model('Room', roomSchema);
    console.log("Comment Room created");
    const commentSchema = new mongoose.Schema({
        username: String,
        comment: String,
        post: {type: mongoose.Schema.Types.ObjectId, ref: "Room"},
        created_date: Date
    });
    console.log("Comment Model created");
}

export default models;