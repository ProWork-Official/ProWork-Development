import mongoose from 'mongoose';

const UserPersonalSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true,
    },
    Email:{
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    isPersonal:{
        type: Boolean,
        default: false,
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const UserPersonal = mongoose.model("UserPersonal", UserPersonalSchema);

export default UserPersonal