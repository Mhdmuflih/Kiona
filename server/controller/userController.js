import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import mongoose from "mongoose";

// ----------------------------------------------

import User from "../model/userModel.js";
import OTP from "../model/otpModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";

// ----------------------------------------------

// password secure
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

// otp generator
const OtpGenerator = () => {
    return Math.floor(1000 + Math.random() * 9000)
}

// otp send to mail
const sendOpt = async (req, res) => {

    let otp = OtpGenerator();    //otp taken
    console.log(otp);

    const transporter = nodemailer.createTransport({     // transporter
        service: "gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    })



    const MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Kiona",
            link: "http://mailgen.js/"
        }
    })

    const response = {                            // responce of mail
        body: {
            name: req.session.email,
            intro: 'Your OTP for KIONA Verification is:',
            table: {
                data: [
                    {
                        OTP: otp
                    }
                ]
            },
            outro: "looking forward to doing more Business"
        }
    }

    const mail = MailGenerator.generate(response)

    const message = {                             // message sent in the email
        from: process.env.AUTH_EMAIL,
        to: req.session.email,
        subject: 'KIONA otp Verification',
        html: mail
    }

    try {                      // otp save in db and send mail
        const newOtp = new OTP({
            email: req.session.email,
            OTP: otp,
            createdAt: Date.now(),
            expaireAt: Date.now() + 60000
        })
        const data = await newOtp.save()
        req.session.otpId = data._id
        await transporter.sendMail(message)
    } catch (error) {
        console.log(error.message,)
    }
}


// user registration page
const register = async (req, res) => {
    try {
        res.render('users/registration.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

// user input
const insertUser = async (req, res) => {
    try {

        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email })
            if (existingUser) {
                console.log("Email id already taken")
            }
        }
        req.session.email = req.body.email

        const password = req.body.password
        const sPassword = await securePassword(password)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
            password: sPassword,
            is_block: 0,
            is_verified: 1,
            is_admin: 0
        })

        req.session.userData = user
        console.log(req.session.userData)

        await sendOpt(req, res)
        res.redirect('/otp')


    } catch (error) {
        console.log(error.message);
    }
}

// otp page
const otp = async (req, res) => {
    try {
        const message = req.query.message
        res.render('users/otp-verification.ejs',{ message })
    } catch (error) {
        console.log(error.message)
    }
}



// re - send otp fucntion
const resendOTP = async (req, res) => {
    try {
        let otp = OtpGenerator()
        console.log(otp);

        if (!req.session.email) {
            throw new Error("Recipient email not found in session.");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            }
        });

        const MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Kiona",
                link: "http://mailgen.js/"
            }
        });

        const response = {
            body: {
                name: req.session.email,
                intro: 'Your OTP for KIONA Verification is:',
                table: {
                    data: [{
                        OTP: otp
                    }]
                },
                outro: "looking forward to doing more Business"
            }
        };

        const mail = MailGenerator.generate(response);

        const message = {
            from: process.env.AUTH_EMAIL,
            to: req.session.email, // Set recipient email
            subject: 'KIONA re-send OTP Verification',
            html: mail
        };

        await OTP.updateOne({
            email: req.session.email
        }, {
            $set: { OTP: otp }
        })


        await transporter.sendMail(message);

        res.send({ success: true }); // Sending success response
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error: error.message }); // Sending error response
    }
};

// verify Mail
const verifyOtp = async (req, res) => {
    try {

        const { otp1, otp2, otp3, otp4 } = req.body
        const otp = [otp1, otp2, otp3, otp4].join('')
        console.log(otp)

        const otpData = await OTP.findOne({ email: req.session.email })
        console.log(otpData)

        if (!otpData) {
            return redirect('/otp')
        }

        if (otpData.OTP == otp) {
            const userData = new User(req.session.userData)

            console.log(userData);
            await userData.save()

            await OTP.deleteOne({ email: req.session.email })
            res.redirect("/")
        }else{
            return res.redirect('/otp?message=invalid');
        }
    } catch (error) {
        console.log(error.message)
    }
}


// login user page
const login = async (req, res) => {
    try {
        const message = req.query.message
        res.render('users/login.ejs', { message })
    } catch (error) {
        console.log(error.message)
    }
}

// verify login page
const verifyLogin = async (req, res) => {
    try {

        const { email, password } = req.body
        console.log(req.body)
        
        const userData = await User.findOne({ email })

        if(!userData){
            res.render('users/login.ejs', {
                message: "Email ID and Password incorrect"
            })
        }

        if (userData.is_block) {
            return res.render('users/login.ejs', {
                message: "User is blocked by Admin",
                userBlocked: true
            });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password)
        if(!passwordMatch){
            return res.render('users/login.ejs', {
                message: "user email id and password incorrect"
            });
        }

        if(userData.is_verified === 0){
            return res.render('users/login.ejs', {
                message:"Please verify Your email address to login."
            })
        }

        req.session.user_id = userData._id;
        res.redirect('/');

    } catch (error) {
        console.log(error.message)
    }
}

//login Home
const loginHome = async (req, res) => {
    try {
        const id = req.session.user_id
        const userData = await User.findById(id)
        const products = await Product.find({ delete: false })
        const user = req.session.user_id

        res.render('users/index.ejs', { user: userData || 'muflih', products, user })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
}

// user product details page
const productPage = async (req, res) => {
    try {
        const user = req.session.user_id;
        const products = await Product.find({ delete: false });
        
        res.render('users/product.ejs', { user, products })
    } catch (error) {
        console.log(error.message);
    }
}

//user single product details page
const productDetails = async(req,res)=>{
    try {

        const { productId } = req.query
        const user = req.session.user_id

        const product = await Product.findOne({ _id:productId})
        console.log(product);

        res.render('users/product-detail.ejs', { user, product })

    } catch (error) {
        console.log(error.message);
    }
}

//user shoping cat
const cart = async (req, res) => {
    try {
        const user = req.session.user_id;
        console.log(user);
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

        console.log('muflih',cartProduct);
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

        await Cart.findOneAndUpdate({"cartItems._id":cartItemsId},{$inc:{"cartItems.$.quantity":1}})

        res.json({success:true})

    } catch (error) {
        console.log(error);
    }
}

//cart Product Quantity decrement
const decrementQuantity = async (req,res)=>{
    try {
     
        const { cartItemsId } = req.body;

        await Cart.findOneAndUpdate({ "cartItems._id":cartItemsId },{ $inc:{ "cartItems.$.quantity":-1 } })

        res.json({success:true})

    } catch (error) {
        console.log(error);
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

//404 page
const notPage = async(req,res)=>{
    try {
        res.render('users/404.ejs');
    } catch (error) {
        console.log(error.message);
    }
}


//user logout
const userLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.redirect('/'); // Redirect or handle the error as needed
        } else {
            res.redirect('/');
        }
    });
};


export {
    login,
    register,
    insertUser,
    verifyLogin,
    loginHome,
    otp,
    verifyOtp,
    userLogout,
    resendOTP,

    productPage,
    productDetails,

    cart,
    incrementQuantity,
    decrementQuantity,
    addToCart,

    notPage

}