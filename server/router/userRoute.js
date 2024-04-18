import express from "express";
import multer from "multer";                // multer is using in take a image store
import path from "path";
import session from "express-session";

import { isLogin,isLogout,Cache } from "../middleware/userAuth.js";
import { login, register, insertUser, verifyLogin, loginHome, otp, verifyOtp, userLogout, resendOTP, productPage, productDetails, cart } from "../controller/userController.js";
import { addAddress, addAddressPage, addressPage, deleteAddress, editAddresPage, editAddress, passwordChangePage, profilePage, updatePassword, updateProfile } from "../controller/userProfileController.js";

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

// Route
// user_route.get('/',isLogout,home)

// register route
user_route.get('/register',isLogout,register)
user_route.post('/register',upload.single('image'),insertUser)

// verifyMail route
user_route.get('/otp',isLogout,otp)
user_route.post('/otp',verifyOtp)

user_route.post('/resend-otp', resendOTP, verifyOtp)

// login route
user_route.get('/login',isLogout,login)
user_route.post('/login',verifyLogin)

//forgot passeord
// user_route.get('/forgot',forgot)
// user_route.post('/forgot',forgotOTP)

//login Home
user_route.get('/',loginHome)

//product show details
user_route.get('/products',productPage)
user_route.get('/productDetails',productDetails)

//user Profile
user_route.get('/userProfile',profilePage)
user_route.put('/userProfile',updateProfile)


user_route.get('/changePassword',passwordChangePage)
user_route.post('/changePassword',updatePassword)


user_route.get('/address',addressPage)
user_route.delete('/address/delete',deleteAddress)
user_route.get('/address/editAddress',editAddresPage)
user_route.post('/address/editAddress',editAddress)

user_route.get('/addAddress',addAddressPage)
user_route.post('/addAddress',addAddress)


//shoping carts
user_route.get('/shoping-cart',cart)

//logout
user_route.get('/logout',isLogin,userLogout)





export default user_route


