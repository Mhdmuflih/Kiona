import express from "express";
import session from "express-session";
import multer from "multer"; // multer is using in take a image store
import path from "path";

import { addToCart, cart, checkoutAddAddress, checkoutAddAddressPage, checkoutDeleteAddress, checkoutEditAddress, checkoutEditAddressPage, checkoutPage, decrementQuantity, incrementQuantity, removeCart, selectAddress, summary } from "../controller/user/userCartController.js";
import { forgotOtpPage, forgotOtpVerification, forgotPassword, forgotPasswordPage, insertUser, login, loginHome, otp, productDetails, productPage, register, resendOTP, resetPassword, resetPasswordPage, userLogout, verifyLogin, verifyOtp } from "../controller/user/userController.js";
import { orderSuccessPage, payment, verifyPayment } from "../controller/user/userOrderController.js";
import { addAddress, addAddressPage, addressPage, cancelOrder, deleteAddress, editAddresPage, editAddress, orderDetailsPage, orderPage, passwordChangePage, profilePage, remove, returnOrder, updatePassword, updateProfile, wishlistPage } from "../controller/user/userProfileController.js";
import { addToWishlist } from "../controller/user/userWishlist.js";
import { Cache, isLogin, isLogout } from "../middleware/userAuth.js";

// import { forgot, forgotOTP } from "../controller/forgotPassword.js";
// -----------------------------------------------------------------------

const user_route = express();   //express connection
// ---------------------------

const __dirname = path.resolve()  //to take the dirname(directery name) path in this new feature

//------------------------------------------------session working code------------------------------------------------
user_route.use(session({
    secret: 'allisWell',
    resave: false,
    saveUninitialized: false
}));

user_route.use(express.static('assets'))

//------------------------------------------------no-cache  no Store------------------------------------------------
user_route.use(Cache)                           //Cache - controller

// -----------------------------------------------------------------------
//photo storage in using multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        console.log(file)
        cb(null,path.join(__dirname,'assets/Photos/userImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now() + " - " + file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage})
// -----------------------------------------------------------------------

//------------------------------------------------register route------------------------------------------------
user_route.get('/register',isLogout,register)                           //registion page
user_route.post('/register',upload.single('image'),insertUser)          //insert user

//------------------------------------------------verifyMail route------------------------------------------------
user_route.get('/otp',isLogout,otp)                                     //otp page
user_route.post('/otp',verifyOtp)                                       //verify otp
user_route.post('/resend-otp', resendOTP, verifyOtp)                    //resend otp

//------------------------------------------------login route------------------------------------------------
user_route.get('/login',isLogout,login)                                 //login page
user_route.post('/login',verifyLogin)                                   //verify the user

//forgot passeord
user_route.get('/forgot',forgotPasswordPage)
user_route.post('/forgot',forgotPassword)
user_route.get('/forgotOtp',forgotOtpPage)
user_route.post('/forgotOtp',forgotOtpVerification)
user_route.get('/resetPassword',resetPasswordPage)
user_route.post('/resetPassword',resetPassword)

//------------------------------------------------login Home------------------------------------------------
user_route.get('/',loginHome)                                           //home page.

//------------------------------------------------product show details------------------------------------------------
user_route.get('/products',productPage)                                 //show the product page
user_route.get('/productDetails',productDetails)                        //single product details


//------------------------------------------------user Profile------------------------------------------------
user_route.get('/userProfile',isLogin,profilePage)                              //user profile page
user_route.put('/userProfile',updateProfile)                            //update user profile


user_route.get('/changePassword',isLogin,passwordChangePage)                    //change user password page
user_route.post('/changePassword',updatePassword)                       //change password


user_route.get('/address',isLogin,addressPage)                                  //user address page
user_route.delete('/address/delete',deleteAddress)                      //delete user address

user_route.get('/address/editAddress',isLogin,editAddresPage)                   //edit user address page
user_route.post('/address/editAddress',editAddress)                     //edit user address

user_route.get('/addAddress',isLogin,addAddressPage)                            //add address page
user_route.post('/addAddress',addAddress)                               //add user addresses

user_route.get('/order',isLogin,orderPage)                              //ordered Product Show
user_route.get('/orderDetails',isLogin,orderDetailsPage)                //single order product details and status show
user_route.patch('/orderDetails/cancelOrder',cancelOrder)      //cancel the order
user_route.patch('/orderDetails/returnOrder',returnOrder)       //retuen order status


//------------------------------------------------shoping carts------------------------------------------------
user_route.get('/shoping-cart',cart)                                    //user cart page
user_route.post('/productDetails/cart',addToCart)                       //add to cart
user_route.post('/shoping-cart/increment',incrementQuantity)            //increment quantity
user_route.post('/shoping-cart/decrement',decrementQuantity)            //decrement quantity
user_route.delete('/shoping-cart/remove',removeCart)                    //remove from cart

//------------------------------------------------select Address in order ,checkout, order------------------------------------------------
user_route.get('/shoping-cart/selectAddress',isLogin,selectAddress)             //checkout address select page
user_route.delete('/shoping-cart/selectAddress/delete',checkoutDeleteAddress)

user_route.get('/shoping-cart/selectAddress/addAddress',isLogin,checkoutAddAddressPage)     //checkout Add address page
user_route.post('/shoping-cart/selectAddress/addAddress',checkoutAddAddress)        //checkoout add address

user_route.get('/shoping-cart/selectAddress/editAddress',isLogin,checkoutEditAddressPage)       //checkout edit address page
user_route.post('/shoping-cart/selectAddress/editAddress',checkoutEditAddress)          //checkout Edit address

user_route.get('/shoping-cart/checkout_summary',isLogin,summary)                //summay of order

// ------------------------------------------------All Payments------------------------------------------------
user_route.get('/checkout',isLogin,checkoutPage)                                //checkout page
user_route.post('/checkout/payment',payment)                                            //payment
user_route.post('/paymentSuccess',verifyPayment)

user_route.get('/orderSuccess',isLogin,orderSuccessPage)                                //order succes page

//------------------------------------------------Wishlist------------------------------------------------
user_route.get('/wishlist',isLogin,wishlistPage)
user_route.post('/products/wishlist',addToWishlist)
user_route.delete('/wishlist/remove',remove)



//logout
user_route.get('/logout',isLogin,userLogout)                            //logout user

// user_route.get('/*',notPage)



export default user_route


