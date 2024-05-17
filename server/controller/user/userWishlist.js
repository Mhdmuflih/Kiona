import Product from "../../model/productModel.js";
import Wishlist from "../../model/wishlistModel.js";

//add to wishlist
const addToWishlist = async(req,res)=>{
    try {

        const userId = req.session.user_id
        const { productId } = req.body;

        if(!userId || !productId){
            return res.json({ success:false, message:"Login in Account" });
        }

        const existingProduct = await Wishlist.findOne({ userId:userId, "wishlistItems.productId":productId } )
        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product is not found" });
        }

        if (existingProduct) {
            return res.json({ success: false, message: "Product already added to the wishlist" });
        }

        await Wishlist.updateOne(
            { userId:userId },
            { $push:{ wishlistItems:{ productId:productId } } },
            { upsert:true }
        )

        res.json({ success:true, message:"Added Wishlist" })
        
    } catch (error) {
        console.log(error.message);
    }
}



export {
    addToWishlist
};
