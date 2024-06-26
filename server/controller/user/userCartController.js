import mongoose from "mongoose";

// ----------------------------------------------

import Address from "../../model/addressModel.js";
import Cart from "../../model/cartModel.js";
import Product from "../../model/productModel.js";
import User from "../../model/userModel.js";
import Wishlist from "../../model/wishlistModel.js";
import Coupon from "../../model/couponModel.js";

// ----------------------------------------------


//user shoping cat
const cart = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        if (!user) {
            return res.redirect('/login');
        }

        let cartProduct = await Cart.aggregate([
            { $match:{ userId: mongoose.Types.ObjectId(user)  } },
            { $unwind:"$cartItems" },
            { $lookup:
                {
                    from:"products",
                    localField:"cartItems.productId",
                    foreignField:"_id",
                    as:"productDetails"
                }
            },
            {
                $match: { 'productDetails.delete': false }
            }
        ])

        let wishlistProduct = await Wishlist.aggregate([
            { $match:{ userId: mongoose.Types.ObjectId(user) } },
            { $unwind:"$wishlistItems" },
            { $lookup:{
                from:"products",
                localField:"wishlistItems.productId",
                foreignField:"_id",
                as:"productDetails"
            } }
        ])

        const coupon = await Coupon.find()

        let message;

        res.render('users/shoping-cart.ejs', { user, cartProduct, wishlistProduct, message:message, coupon });
        
    } catch (error) {
        console.log(error.message);
        next(error.message);
        res.status(500).send('Internal server error');
    }
}

//cart prodcut quantity increment.
const incrementQuantity = async(req, res, next)=>{
    try {
        
        const { cartItemsId } = req.body;
        const cartId = await Cart.findOne({"cartItems._id":cartItemsId})
        
        const items = cartId.cartItems
        const item = items.find(item => item._id == cartItemsId);

        const product = await Product.findOne({_id:item.productId})
        
        if(product.quantity>item.quantity && item.quantity < 5 ){
            await Cart.findOneAndUpdate({"cartItems._id":cartItemsId},{$inc:{"cartItems.$.quantity":1}})
        }else{
            res.json({success:false, message:"Product quantity is not sufficient to add to the cart."})
        }

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//cart Product Quantity decrement
const decrementQuantity = async (req, res, next)=>{
    try {
     
        const { cartItemsId } = req.body;

        const updatedCartItem = await Cart.findOneAndUpdate({ "cartItems._id": cartItemsId, "cartItems.quantity": { $gt: 1 }},
            { $inc: { "cartItems.$.quantity": -1 }},
            { new: true }
        );
          

        res.json({success:true})

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }

}

//add to cart in product details page
const addToCart = async (req, res, next)=>{
    try {

        const userId = req.session.user_id
        const { productId } = req.body;

        if (!userId || !productId) {
            return res.json({ success: false, message: "Login in Account" });
        }

        const existingCartItem = await Cart.findOne({ userId:userId, "cartItems.productId":productId })
        const product = await Product.findById(productId)

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        if(product.quantity === 0 ){
            return res.json({ success: false, message: "Product not found" });
        }

        if(existingCartItem){
            return res.json({success:false, message:"Product already exists in the cart"})
        }

        await Cart.updateOne(
            { userId: userId },
            { $push: { cartItems: { productId: productId } } },
            { upsert: true }
        );

                
        res.json({ success: true, message: "Added to Cart" });

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//applay coupon
const applyCoupon = async(req, res, next)=>{
    try {
        const { couponCode,totalPrice } = req.body

        const coupon = await Coupon.findOne({ couponCode })
        if(!coupon){
            return res.json({ success:false, message:"coupon is not there" })
        }

        if(totalPrice<coupon.minAmount){
            return res.json({ success:false, message:"you not aligible for this coupon" })
        }

        const offerDiscound = (coupon.offer/100)
        const discountAmount  = offerDiscound*totalPrice
        const totalAmount = totalPrice - discountAmount
        //sen
        req.session.totalPrice = totalAmount

        return res.json({ success:true, message:"Coupon Applyed", totalAmount, discountAmount })

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


//remove cart products
const removeCart = async(req, res, next)=>{
    try {
        
        const { id } = req.body;
        const userId = req.session.user_id

        const removedCartItem = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { cartItems: { productId: id } } },
            { new: true }
        );
        
        if (removedCartItem) {
            res.json({ success: true, message: "Cart item removed successfully" });
        } else {
            res.json({ success: false, message: "Failed to remove cart item" });
        }

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


//checkout address showing page
const selectAddress = async (req, res, next) => {
    try {
        const id = req.session.user_id;
        const user = await User.findOne({ _id: id });

        let cartProduct = await Cart.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(id) } },
            { $unwind: "$cartItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "cartItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ]);

        if (cartProduct.length === 0) {
            return res.redirect('/shoping-cart');
        }
        
        let totalPrice = 0;
        let subTotal = 0;
        let discount = 0;

        for (let i = 0; i < cartProduct.length; i++) {
            const cartItem = cartProduct[i].cartItems;
            const productDetails = cartProduct[i].productDetails;

            for (let j = 0; j < productDetails.length; j++) {
                const quantity = cartItem.quantity;
                const prodcutQuantity = productDetails[j].quantity

                if(quantity>prodcutQuantity){
                    return res.redirect('/shoping-cart')
                }

                let price;
                let subPrice;
                if (productDetails[j].offerPrice) {
                    price = productDetails[j].offerPrice;
                    subPrice = productDetails[j].price
                } else {
                    price = productDetails[j].price;
                    subPrice = productDetails[j].price
                }

                const itemTotalPrice = quantity * price;
                totalPrice += itemTotalPrice;

                subTotal += quantity * subPrice

                discount = subTotal - totalPrice
            }
        }

        if(req.session.totalPrice == undefined || req.session.totalPrice == null){
            req.session.totalPrice = totalPrice
        }else{
            totalPrice = req.session.totalPrice
        }


        let addressData = await Address.findOne({ userId: id });
        if (!addressData) {
            addressData = { addresses: [] };
        }

        res.render('users/checkout/showAddress.ejs', { user, addressData, totalPrice, subTotal, discount });
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


//checkout add address page
const checkoutAddAddressPage = async(req, res, next)=>{
    try {
        
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })

        res.render("users/checkout/CheckoutAddAddress", { user })

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout add Address
const checkoutAddAddress = async(req, res, next)=>{
    try {

        const id = req.session.user_id;
        const checkUser = await Address.findOne({ userId:id });
        let address;

        if(!checkUser){
            address = new Address({
                userId:id,
                addresses:[
                    {
                        name:req.body.name,
                        mobile:req.body.mobile,
                        pincode:req.body.pincode,
                        locality:req.body.locality,
                        address:req.body.address,
                        city:req.body.city,
                        state:req.body.state,
                        defaultAddress: req.body.defaultAddress || true,
                        addressType: req.body.addressType
                    }
                ]
            })
        }else{
            checkUser.addresses.push({
                name:req.body.name,
                mobile:req.body.mobile,
                pincode:req.body.pincode,
                locality:req.body.locality,
                address:req.body.address,
                city:req.body.city,
                state:req.body.state,
                defaultAddress: req.body.defaultAddress || false,
                addressType:req.body.addressType
            })
            address = checkUser
        }

        const saveAddress = await address.save();
        if(saveAddress){
            res.json({success:true, message:"Address Added "})
        }else{
            res.json({success:false, message:"Add Address Failed"})
        }
        
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout Address edit
const checkoutEditAddressPage = async(req, res, next)=>{
    try {

        const id = req.session.user_id
        const addressId = req.query.id
 

        const user = await User.findOne({_id:id});
        const addressData = await Address.findOne({"addresses._id":addressId})

        let address = {}

        addressData.addresses.forEach(element=>{
            if(addressId == element._id){
                address = element
            }
        })

        res.render('users/checkout/checkoutEditAddress', { user,address })

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout edit address
const checkoutEditAddress = async(req, res, next)=>{
    try {

        const { addressId } = req.query
        const { name, mobile, pincode, locality, address, city, state, addressType } = req.body
        const update = {}

        if(name) update["addresses.$.name"] = name
        if(mobile) update["addresses.$.mobile"] = mobile
        if(pincode) update["addresses.$.pincode"] = pincode
        if (locality) update['addresses.$.locality'] = locality;
        if(address) update["addresses.$.address"] = address
        if(city) update["addresses.$.city"] = city
        if(state) update["addresses.$.state"] = state
        if(addressType) update["addresses.$.addressType"] = addressType
 
        const addressData = await Address.findOneAndUpdate({"addresses._id":addressId},{$set:update})

        if(addressData){
            res.json({success:true,message:"Address Updated"})
        }else{
            res.json({success:false, message:"No address found with the given ID"})
        }
        
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout Delete Address
const checkoutDeleteAddress = async(req, res, next)=>{
    try {

        const { id } = req.body

        const response = await Address.updateOne(
            { },
            { $pull: { addresses: { _id: id } } }
        );

        if(response){
            res.json({success:true, message: "Address deleted successfully"})
        }else{
            res.json({success:false, message: "Address not found or already deleted"})
        }

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout Summary
const summary = async(req, res, next)=>{
    try {

        const addressId = req.query.id
        const user = req.session.user_id
        const totalAmount = req.session.totalPrice

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

        const addressData = await Address.findOne({"addresses._id":addressId})

        let address = {}

        addressData.addresses.forEach(element=>{
            if(addressId == element._id){
                address = element
            }
        })

        req.session.address_data = address
        req.session.cartProduct = cartProduct

        res.render('users/checkout/checkoutSummary.ejs',{ user, cartProduct, address, totalAmount })

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//checkout page
const checkoutPage = async(req, res, next)=>{
    try {
        
        const user = req.session.user_id;
        const cart = req.session.cartProduct

        const cartItemsWithDetails = cart.map(item => item.productDetails);

        var allProduct = []

        for(let i = 0; i < cartItemsWithDetails.length; i++){
            let products = cartItemsWithDetails[i];
            for(let j = 0; j < products.length; j++){

                let product = products[j];
                allProduct.push({
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    offerPrice:product.offerPrice,
                    offer:product.offer,
                    category: product.category,
                    quantity: product.quantity,
                    description: product.description,
                    image: product.image
                });
            }
        }
        
        req.session.cartAllProduct = allProduct

        res.render("users/checkout/checkout.ejs", { user })

    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}


export {
    addToCart,

    applyCoupon,

    cart,
    checkoutAddAddress,
    checkoutAddAddressPage,
    checkoutDeleteAddress,
    checkoutEditAddress,
    checkoutEditAddressPage,
    checkoutPage,
    decrementQuantity,
    incrementQuantity,
    removeCart,
    selectAddress,
    summary
};

