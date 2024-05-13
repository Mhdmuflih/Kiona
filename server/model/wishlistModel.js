import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    wishlistItems:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true
            }
        }
    ]
})

export default mongoose.model('Wishlist',wishlistSchema);