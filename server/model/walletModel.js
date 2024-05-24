import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    balance:{
        type:Number,
        default:0
    },
    walletHistory:[
        {
            date:{
                type:Date
            },
            amount:{
                type:Number
            },
            description:{
                type:String
            },
            currentBalence:{
                type:Number
            }
        }
    ]
})

export default mongoose.model("wallet",walletSchema)