import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
    AadharFront: {
        type: String, 
        required: true,
    },
    AadharBack: {
        type: String, 
        required: true,
    },
    ShopPhoto1: {
        type: String,
        required: true,
    },
    ShopPhoto2: {
        type: String, 
        required: true,
    },
    ShopPhoto3: {
        type: String,
        required: true,
    },
    ShopName: {
        type: String,
        required: true,
    },
    ShopDescription: {
        type: String,
        required: true,
    },
    ShopAddress: {
        type: String,
        required: true,
    },
    ShopCategory: {
        type: String,
        required: true,
    },
    Area: {
      type: Array,
      required: true,
    },
    City: {
      type: String,
      enum: ['Prayagraj'],
      required: true,
    },
    FullName: {
      type: String,
      required: true,
    },
    ShopEmail: {
      type: String,
      required: true,
      match: /.+\@.+\..+/
    },
    ShopPhoneNumber: {
        type: String, 
        required: true,
    },
    isWorker: {
        type: Boolean,
        default: false,
    },
    isService: { 
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});
const Worker = mongoose.model('Worker', WorkerSchema);

export default Worker;