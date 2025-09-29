import mongoose from 'mongoose';

const WorkerReviewSchema = new mongoose.Schema({
    StarRating:{
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    TextReview:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    UserObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    WorkerObjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker"
    }
});

const WorkerReview = mongoose.model("WorkerReview", WorkerReviewSchema);

export default WorkerReview