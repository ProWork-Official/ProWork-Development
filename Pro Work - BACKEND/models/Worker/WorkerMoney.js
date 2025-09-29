import mongoose from 'mongoose';

const WorkerMoneySchema = new mongoose.Schema({
    WorkerBalance:{
        type: Number,
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    WorkerObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker"
    }  
})

const WorkerMoney = mongoose.model("WorkerMoney", WorkerMoneySchema);

export default WorkerMoney