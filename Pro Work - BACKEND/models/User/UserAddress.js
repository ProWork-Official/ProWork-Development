import mongoose from 'mongoose';

const UserAddressSchema = new mongoose.Schema({
    Address:{
        type: String,
        required: true,
    },
    Landmark:{
        type: String,
        required: true,
    },
    PinCode:{
        type: Number,
        required: true,
    },
    isAddress:{
        type: Boolean,
        default: false,
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const UserAddress = mongoose.model("UserAddress", UserAddressSchema);

export default UserAddress