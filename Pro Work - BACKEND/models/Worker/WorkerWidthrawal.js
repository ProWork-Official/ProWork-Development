import mongoose from 'mongoose';

const WorkerWidthdrawalSchema = new mongoose.Schema({
    WidthrawalBalance:{
        type: Number,
    },
    WidthrawalStatus:{
        type: String,
        default: "Pending",
    },
    BankName:{
        type: String,
        required: true,
    },
    AccountNumber:{
        type: Number,
        // required: true,
        // unique: true,
        
    },
    BookingDateTime:{
        type: Date,
        default: Date.now,
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // unique: true
    },
    WorkerObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker"
    }  
})

const WorkerWidthdrawal = mongoose.model("WorkerWidthdrawal", WorkerWidthdrawalSchema);

export default WorkerWidthdrawal