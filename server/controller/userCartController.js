import mongoose from "mongoose";

// ----------------------------------------------

import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";

// ----------------------------------------------


//user shoping cat
const cart = async (req, res) => {
    try {
        const user = req.session.user_id;
        if (!user) {
            return res.redirect('/login');
        }

        let cartProduct = await Cart.aggregate([
            { $match:{ userId: mongoose.Types.ObjectId(user)  } },
            { $unwind:"$cartItems" },
            { $lookup:{
                from:"products",
                localField:"cartItems.productId",
                foreignField:"_id",
                as:"productDetails"
            } }
        ])

        res.render('users/shoping-cart.ejs', { user, cartProduct });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
}

//cart prodcut quantity increment.
const incrementQuantity = async(req,res)=>{
    try {
        
        const { cartItemsId } = req.body;

        const cartId = await Cart.findOne({"cartItems._id":cartItemsId})
        
        const items = cartId.cartItems

        const item = items.find(item => item._id == cartItemsId);

       const product = await Product.findOne({_id:item.productId})

       if(product.quantity>item.quantity){
        await Cart.findOneAndUpdate({"cartItems._id":cartItemsId},{$inc:{"cartItems.$.quantity":1}})
        return res.json({success:true})
       }

    } catch (error) {
        console.log(error.message);
    }
}

//cart Product Quantity decrement
const decrementQuantity = async (req,res)=>{
    try {
     
        const { cartItemsId } = req.body;

        console.log(cartItemsId);

        // const checkQuantity = await Cart.findOne({"cartItems._id":cartItemsId})

        // console.log(checkQuantity);

        // checkQuantity.cartItems.forEach(item => {
        //     console.log(item.quantity);
        //   });


        const updatedCartItem = await Cart.findOneAndUpdate({ "cartItems._id": cartItemsId, "cartItems.quantity": { $gt: 1 }},
            { $inc: { "cartItems.$.quantity": -1 }},
            { new: true }
        );
          

        res.json({success:true})

    } catch (error) {
        console.log(error.message);
    }

}

//add to cart in product details page
const addToCart = async (req,res)=>{
    try {

        const userId = req.session.user_id
        const { productId } = req.body;


        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: "Missing user ID or product ID" });
        }

        const existingCartItem = await Cart.findOne({ userId:userId, "cartItems.productId":productId })

        if(existingCartItem){
            return res.json({success:false, message:"Product already exists in the cart"})
        }

       await Cart.updateOne(
            { userId: userId },
            { $push: { cartItems: { productId: productId } } },
            { upsert: true }      // Create the cart if it doesn't exist
        );

        
        res.json({ success: true, message: "Added to Cart" });

    } catch (error) {
        console.log(error.message);
    }
}

export{
    cart,
    addToCart,
    incrementQuantity,
    decrementQuantity
}
