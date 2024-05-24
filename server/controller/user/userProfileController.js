import Address from "../../model/addressModel.js";
import Order from "../../model/orderModel.js";
import Product from "../../model/productModel.js";
import User from "../../model/userModel.js";
import Wishlist from "../../model/wishlistModel.js";
import Wallet from "../../model/walletModel.js";

// ------------------------------------

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Razorpay from "razorpay";

// ------------------------------------

var razorpayInstance = new Razorpay({
    key_id:"rzp_test_FRaUz1vihG1Qvx",
    key_secret: "nuvwbLogUjNjYJEXtu5BR6dp"
  });

// ------------------------------------


// password security function
const securePassword = async (password) => {
    try {
        const passwordHarsh = await bcrypt.hash(password, 10);
        console.log(`Hash Password ${passwordHarsh}`)
        return passwordHarsh
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}



//user Profile Page
const profilePage = async (req,res)=>{
    try {

        const id = req.session.user_id
        const user = await User.findOne({ _id:id })
        
        res.render('users/Profile/userProfile.ejs',{user, message:req.query.message})

    } catch (error) {
        console.log(error.message);
    }
}

//user Profile Update
const updateProfile = async(req,res)=>{
    try {

        const id = req.session.user_id;
        const {name, mobile} = req.body

        const response = await User.findByIdAndUpdate({ _id:id}, { $set: { name:name, mobile:mobile } })

        if(response){
            res.json({success:true, message:"Profile Updated"})
        }else{
            res.json({success:false, message:"Server Error"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

//user Password Changing Page
const passwordChangePage = async (req,res)=>{
    try {
     
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })
    
        res.render('users/Profile/userPasswordManagement.ejs',{user})
        
    } catch (error) {
        console.log(error.message);
    }
}

//user Password Update
const updatePassword = async(req,res)=>{
    try {

        const id = req.session.user_id;
        const { password, password1, password2 } = req.body;
        const userData = await User.findOne({ _id:id });
        const passwordMatch = await bcrypt.compare(password,userData.password);

        if(!passwordMatch){
            return res.status(400).json({success:false, message:"Your Password is not Match"});
        }
        if(password1 !== password2){
            return res.status(400).json({success:false, message:"Your New Password is not Match"});
        }

        const sPassword = await securePassword(password1);
        await User.updateOne({_id:id},{ $set: { password:sPassword } });
        res.status(200).json({success:true, message:"Password Updated"});
                
    } catch (error) {
        console.log(error.message);
    }
}

//user Address Management Page
const addressPage = async(req,res)=>{
    try {
        
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })

        let addressData = await Address.findOne({userId:id})
        if(!addressData){
            addressData =  { addresses: [] };
        }

        res.render('users/Profile/userAddressManagement.ejs',{ user, addressData })

    } catch (error) {
        console.log(error.message);
    }
}

//add Address Page
const addAddressPage = async(req,res)=>{
    try {
        
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })
        res.render('users/Profile/addAddress.ejs',{ user })

    } catch (error) {
        console.log(error.message);
    }
}

//add address
const addAddress = async(req,res)=>{
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
        console.log(error);
    }
}

//edit Address Page
const editAddresPage = async(req,res)=>{
    try {
        const id = req.session.user_id
        const addressId = req.query.id

        const user = await User.findOne({_id:id})
        const addressData = await Address.findOne({"addresses._id":addressId})

        let address = {}

        addressData.addresses.forEach(element => {
            if(addressId == element._id){
                address = element
            }
        });


        res.render("users/Profile/editAddress.ejs",{ user, address })

    } catch (error) {
        console.log(error.message);
    }
}

//edit Address
const editAddress = async(req,res)=>{
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
 
        const addressData = await Address.findOneAndUpdate({"addresses._id":addressId},{$set:update}, {new:true})

        if(addressData){
            res.json({success:true,message:"Address Updated"})
        }else{
            res.json({success:false, message:"No address found with the given ID"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

//delete address
const deleteAddress = async(req,res)=>{
    try {
        
        const id  = req.body.id;
        const userId = req.session.user_id

        const response = await Address.updateOne(
            { userId:userId },
            { $pull: { addresses: { _id: id } } }
        );

        if(response){
            res.json({success:true, message: "Address deleted successfully"})
        }else{
            res.json({success:false, message: "Address not found or already deleted"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

//user order details page
const orderPage = async (req,res)=>{
    try {
        
        const userId = req.session.user_id

        const user = await User.findOne({_id:userId})
        const order = await Order.find({ userId })

        res.render('users/Profile/userOrderDetails',{ user, order })

    } catch (error) {
        console.log(error.message);
    }
}

//order details page
const orderDetailsPage = async(req,res)=>{
    try {
        const id = req.session.user_id
        const orderId = req.query.id

        const orderItem = await Order.findOne({ 'orderItems._id':orderId })
        
        let ordered = null;
        for (let i = 0; i < orderItem.orderItems.length; i++) {
            if (orderItem.orderItems[i]._id.toString() === orderId) {
                ordered = orderItem.orderItems[i];
                break;
            }
        }

        const user = await User.findOne({_id:id})

        res.render('users/Profile/orderDetails.ejs',{ user, orderItem, ordered })

    } catch (error) {
        console.log(error.message);
    }
}

//cancel order
const cancelOrder = async (req, res) => {
    try {
        const user = req.session.user_id;
        const { id, reason } = req.body;
        
        const orders = await Order.find({ userId: user });
        
        let response;
        let cancelOrderItem;
        let order;
        for (let i = 0; i < orders.length; i++) {
            const orderItems = orders[i].orderItems;
            for (let j = 0; j < orderItems.length; j++) {
                if (orderItems[j]._id.toString() === id) {
                    cancelOrderItem = orderItems[j]
                    order = orders[i]
                    response = await Order.findOneAndUpdate(
                        { userId: user, 'orderItems._id': id },
                        { $set: { "orderItems.$.cancelReason": reason, "orderItems.$.orderStatus": "Cancelled", "orderItems.$.paymentStatus":"Refound Completed" } }
                    );
                    break;
                }
            }
            if (response) break;
        }

        await Product.findByIdAndUpdate({ _id:cancelOrderItem.productId },{ $inc: { quantity:cancelOrderItem.cartQuantity } }, { new:true })

        if(order.paymentMethod === "Online Payment" || order.paymentMethod === "Wallet"){
            const totalAmount = cancelOrderItem.totalPrice;
            const description = `Refund for Cancel order item with ID ${id}`;

            const walletData = await Wallet.findOne({ userId: user });

            const refundAmount = totalAmount;
            if (walletData) {
                const walletBalance = walletData.balance + refundAmount;

                await Wallet.updateOne(
                    { userId: user },
                    {
                        $inc: { balance: refundAmount },
                        $push: { walletHistory: { amount: refundAmount, description: description, date: new Date() } }
                    }
                );
            } else {
                await Wallet.updateOne(
                    { userId: user },
                    {
                        $set: { balance: refundAmount },
                        $push: { walletHistory: { amount: refundAmount, description: description, date: new Date() } }
                    },
                    { upsert: true }
                );
            }
        }
        
        if (response) {
            res.json({ success: true, message: 'Your order item is successfully cancelled.' });
        } else {
            res.status(500).json({ success: false, message: 'Server error occurred while cancelling the order item.' });
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// return user ordered Product
const returnOrder = async(req,res)=>{
    try {
        
        const user = req.session.user_id
        const { id, reason } = req.body
        
        const order = await Order.find({ userId:user });

        let response;
        let returnOrderItem;
        for(let i=0 ; i<order.length ; i++){
            const orderItem = order[i].orderItems
            for(let j=0 ; j<orderItem.length ; j++){
                if( orderItem[j]._id.toString() === id ){
                    returnOrderItem = orderItem[j]
                    console.log(orderItem[j]);
                    console.log(returnOrderItem,'return order item');
                    response = await Order.findOneAndUpdate({ userId:user, 'orderItems._id':id },{ $set:{ 'orderItems.$.returnReason':reason, "orderItems.$.orderStatus": "Returned", "orderItems.$.paymentStatus":"Refound Completed" } })
                }
                break;
            }
            if(response) break;
        }

        await Product.findByIdAndUpdate({ _id:returnOrderItem.productId },{ $inc:{ quantity:returnOrderItem.cartQuantity } },{ new:true })

        const totalAmount = returnOrderItem.totalPrice;
        const description = `Refund for returned order item with ID ${id}`;

        const walletData = await Wallet.findOne({ userId: user });

        const refundAmount = totalAmount;
        if (walletData) {
            const walletBalance = walletData.balance + refundAmount;

            await Wallet.updateOne(
                { userId: user },
                {
                    $inc: { balance: refundAmount },
                    $push: { walletHistory: { amount: refundAmount, description: description, date: new Date() } }
                }
            );
        } else {
            await Wallet.updateOne(
                { userId: user },
                {
                    $set: { balance: refundAmount },
                    $push: { walletHistory: { amount: refundAmount, description: description, date: new Date() } }
                },
                { upsert: true }
            );
        }

        if(response){
            res.json({ success: true, message: "Your order item is successfully returned." });
        }else{
            res.status(500).json({ success: false, message: "Server error occurred while returning the order item." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

//user wishlist page
const wishlistPage = async(req,res)=>{
    try {
        
        const id = req.session.user_id
        if(!id){
            res.redirect('/login')
        }

        const user = await User.findOne({ _id:id })

        const wishlist = await Wishlist.aggregate([
            { $match:{ userId:mongoose.Types.ObjectId(user) } },
            { $unwind:"$wishlistItems" },
            { $lookup:{
                from:"products",
                localField:"wishlistItems.productId",
                foreignField:"_id",
                as:"productDetails"
            } }
        ])
        
        // const wishlist = await Wishlist.findOne({ userId: user._id }).populate('wishlistItems.productId');
        // console.log(wishlist);

        res.render('users/Profile/userWishlist.ejs',{ user, wishlist })

    } catch (error) {
        console.log(error.message);
    }
}

//remove wishlist item
const remove = async(req,res)=>{
    try {
        const { id }  = req.body
        const user = req.session.user_id

        const removeWishlist = await Wishlist.findOneAndUpdate(
            { userId: user },
            { $pull: { wishlistItems: { productId: id } } },
            { new: true }
        )

        if(removeWishlist){
            res.json({ success: true, message: "Wishlist item removed successfully" });
        } else {
            res.json({ success: false, message: "Failed to remove wishlist item" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

//wallet page
const walletPage = async(req,res)=>{
    try {

        const userId = req.session.user_id
        const user = await User.findOne({ _id:userId })

        const walletData = await Wallet.findOne({ userId:userId })

        if (!walletData) {
            return res.render('users/Profile/userWallet.ejs', {  user ,walletData: { balance: 0 } });
        }

        res.render('users/Profile/userWallet.ejs',{ user,walletData })
    } catch (error) {
        console.log(error.message);
    }
}

//add wallet Amount
const addWalletAmount = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.session.user_id;

        const wallet = {
            userId: userId,
            balance: Number(amount),
            walletHistory: [
                {
                    date: new Date(),
                    description: "Credit",
                    amount: Number(amount),
                }
            ]
        };

        req.session.walletData = wallet;
        
        const option = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_rcption_${Date.now()}`,
            payment_capture: 1
        };

        const razorpayOrder = await razorpayInstance.orders.create(option);

        return res.status(200).json({
            success: true,
            message: "Order Created ready for Payment",
            key_id: "rzp_test_FRaUz1vihG1Qvx",
            walletAmount: amount,
            razorpayOrderId: razorpayOrder.id
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const verifyWalletAmount = async (req, res) => {
    try {
        // const { paymentId, walletId } = req.body;
        const walletData = req.session.walletData;

        if (walletData) {
            let existingWallet = await Wallet.findOne({ userId: walletData.userId });

            if (existingWallet) {

                existingWallet.balance += walletData.balance;
                existingWallet.walletHistory.push(...walletData.walletHistory);
                await existingWallet.save();
            } else {

                const newWallet = new Wallet(walletData);
                await newWallet.save();
            }

            req.session.walletData = null;

            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'No wallet data in session' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//withdraw
const withdraw = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.session.user_id;

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
        }

        const walletData = await Wallet.findOne({ userId: userId });

        if (!walletData) {
            return res.status(404).json({ success: false, message: "Wallet not found" });
        }

        if (walletData.balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        walletData.balance -= amount;

        walletData.walletHistory.push({
            date: new Date(),
            description: "Debit",
            amount: -amount
        });

        await walletData.save();

        return res.status(200).json({
            success: true,
            message: "Withdrawal successful",
            balance: walletData.balance
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//wallet History
const walletHistoryPage = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const user = await User.findOne({ _id:userId })
        const wallet = await Wallet.findOne({ userId:userId })
        res.render('users/Profile/userWalletHistory.ejs',{ user, wallet })
    } catch (error) {
        console.log(error.message);
    }
}





export {
    addAddress,
    addAddressPage,
    addressPage,
    cancelOrder,
    deleteAddress,

    editAddresPage,
    editAddress,
    
    orderDetailsPage,
    orderPage,
    
    passwordChangePage,
    profilePage,
    remove,
    returnOrder,
    updatePassword,
    updateProfile,
    wishlistPage,

    walletPage,
    addWalletAmount,
    verifyWalletAmount,
    withdraw,
    walletHistoryPage

};
