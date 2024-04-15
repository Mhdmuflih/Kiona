import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    delete:{
        type:Boolean,
        default:false
    }

}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
