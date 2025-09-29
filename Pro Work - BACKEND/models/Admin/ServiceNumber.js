import mongoose from 'mongoose';

const ServiceNumberSchema = new mongoose.Schema({
    TotalBeautician:{
        type: Number,
        default: 0,
    },
    TotalCarpenter:{
        type: Number,
        default: 0,
    },
    TotalElectrician:{
        type: Number,
        default: 0,
    },
    TotalHousehelp:{
        type: Number,
        default: 0,
    },
    TotalPainter:{
        type: Number,
        default: 0,
    },
    TotalPlumber:{
        type: Number,
        default: 0,
    },
    TotalPriest:{
        type: Number,
        default: 0,
    },
    TotalTutor:{
        type: Number,
        default: 0,
    },
});

const ServiceNumber = mongoose.model("ServiceNumber", ServiceNumberSchema);

export default ServiceNumber