import mongoose from 'mongoose';

const WorkerBankSchema = new mongoose.Schema({
    AccountHolderName:{
        type: String,
        required: true,
    },
    BankName:{
        type: String,
        required: true,
    },
    AccountNumber:{
        type: Number,
        required: true,
        unique: true,
    },
    AccountIFSC_code:{
        type: String,
        required: true,
    },
    isBank:{
        type: Boolean,
        default: false,
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

const WorkerBank = mongoose.model("WorkerBank", WorkerBankSchema);

export default WorkerBank