import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    PhoneNumber:{
        type: Number,
        required: true,
        unique: true,
    },
    UserSignUpTime:{
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", UserSchema);

export default User