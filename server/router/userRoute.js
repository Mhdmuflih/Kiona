import express from "express";
import multer from "multer";                // multer is using in take a image store
import path from "path";
import session from "express-session";

import { isLogin,isLogout,Cache } from "../middleware/userAuth.js";
import { login, register, insertUser, verifyLogin, loginHome, otp, verifyOtp, userLogout, resendOTP, productPage, productDetails } from "../controller/userController.js";
import { addAddress, addAddressPage, addressPage, cancelOrder, deleteAddress, editAddresPage, editAddress, orderDetailsPage, orderPage, passwordChangePage, profilePage, returnOrder, updatePassword, updateProfile } from "../controller/userProfileController.js";
import { addToCart, cart, checkoutAddAddress, checkoutAddAddressPage, checkoutDeleteAddress, checkoutEditAddress, checkoutEditAddressPage, checkoutPage, cod, decrementQuantity, incrementQuantity, orderSuccessPage, removeCart, selectAddress, summary } from "../controller/userCartController.js";

// import { forgot, forgotOTP } from "../controller/forgotPassword.js";
// -----------------------------------------------------------------------

const user_route = express();   //express connection
// ---------------------------

const __dirname = path.resolve()  //to take the dirname(directery name) path in this new feature

//session working code
user_route.use(session({
    secret: 'allisWell',
    resave: false,
    saveUninitialized: false
}));

user_route.use(express.static('assets'))

// no-cache  no Store
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

// register route
user_route.get('/register',isLogout,register)                           //registion page
user_route.post('/register',upload.single('image'),insertUser)          //insert user

// verifyMail route
user_route.get('/otp',isLogout,otp)                                     //otp page
user_route.post('/otp',verifyOtp)                                       //verify otp
user_route.post('/resend-otp', resendOTP, verifyOtp)                    //resend otp

// login route
user_route.get('/login',isLogout,login)                                 //login page
user_route.post('/login',verifyLogin)                                   //verify the user

//forgot passeord
// user_route.get('/forgot',forgot)
// user_route.post('/forgot',forgotOTP)

//login Home
user_route.get('/',loginHome)                                           //home page.

//product show details
user_route.get('/products',productPage)                                 //show the product page
user_route.get('/productDetails',productDetails)                        //single product details


//user Profile
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
user_route.patch('/orderDetails/returnOrder',returnOrder)


//shoping carts
user_route.get('/shoping-cart',cart)                                    //user cart page
user_route.post('/productDetails/cart',addToCart)                       //add to cart
user_route.post('/shoping-cart/increment',incrementQuantity)            //increment quantity
user_route.post('/shoping-cart/decrement',decrementQuantity)            //decrement quantity
user_route.delete('/shoping-cart/remove',removeCart)                    //remove from cart

//select Address in order
user_route.get('/shoping-cart/selectAddress',isLogin,selectAddress)             //checkout address select page
user_route.delete('/shoping-cart/selectAddress/delete',checkoutDeleteAddress)

user_route.get('/shoping-cart/selectAddress/addAddress',isLogin,checkoutAddAddressPage)     //checkout Add address page
user_route.post('/shoping-cart/selectAddress/addAddress',checkoutAddAddress)        //checkoout add address

user_route.get('/shoping-cart/selectAddress/editAddress',isLogin,checkoutEditAddressPage)       //checkout edit address page
user_route.post('/shoping-cart/selectAddress/editAddress',checkoutEditAddress)          //checkout Edit address

user_route.get('/shoping-cart/checkout_summary',isLogin,summary)                //summay of order

user_route.get('/checkout',isLogin,checkoutPage)                                //checkout page
user_route.post('/checkout/cod',cod)                                            //cod

user_route.get('/orderSuccess',orderSuccessPage)


//logout
user_route.get('/logout',isLogin,userLogout)                            //logout user

// user_route.get('/*',notPage)



export default user_route


