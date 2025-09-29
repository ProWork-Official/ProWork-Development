import mongoose from 'mongoose';

const UserBookingSchema = new mongoose.Schema({
    PaymentStatus:{
        type: String,
        default: "Pending",
    },
    BookingCategory:{
        type: String
    },
    BookingService:{
        type: String
    },
    ShopName:{
        type: String
    },
    BookingDateTime:{
        type: Date,
        default: Date.now,
    },
    ServiceAmount:{
        type: String
    },
    PaymentGatewayFees:{
        type: String
    },
    PlatformFees:{
        type: String
    },
    TotalAmount:{
        type: String
    },
    WorkerNumber:{
        type: Number
    },
    UserNumber:{
        type: Number
    },
    UserName:{
        type: String
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    WorkerObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker"
    },
})

const UserBooking = mongoose.model("UserBooking", UserBookingSchema);

export default UserBooking