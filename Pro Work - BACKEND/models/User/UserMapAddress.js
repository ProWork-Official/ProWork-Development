import mongoose from "mongoose";

const UserMapAddressSchema = new mongoose.Schema({
  UserObjectID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Home", "Work", "Others"], required: true },
  building: String,
  landmark: String,
  pinCode: String,
  completeAddress: { type: String, required: true },
  coords: {
    lat: Number,
    lng: Number,
  },
  isAddress: { type: Boolean, default: true }
});

export default mongoose.model("UserMapAddress", UserMapAddressSchema);