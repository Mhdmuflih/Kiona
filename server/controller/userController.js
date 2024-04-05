import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import User from "../model/userModel.js";
import OTP from "../model/otpModel.js";
import Product from "../model/productModel.js";

// ----------------------------------------------

// password secure
const securePassword = async (password)=>{
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
const OtpGenerator = ()=>{
    return Math.floor(1000 + Math.random() * 9000)
}

// otp send to mail
const sendOpt = async (req,res)=>{

    let otp = OtpGenerator();    //otp taken
    console.log(otp);

    const transporter = nodemailer.createTransport({     // transporter
        service:"gmail",
        auth:{
            user:process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    })

    

    const MailGenerator = new Mailgen({
        theme:"default",
        product:{
            name:"Kiona",
            link:"http://mailgen.js/"
        }
    })

    const response = {                            // responce of mail
        body:{
            name:req.session.email,
            intro:'Your OTP for KIONA Verification is:',
            table:{
                data:[
                    {
                        OTP:otp
                    }
                ]
            },
            outro:"looking forward to doing more Business"
        }
    }

    const mail = MailGenerator.generate(response)

    const message = {                             // message sent in the email
        from:process.env.AUTH_EMAIL,
        to:req.session.email,
        subject:'KIONA otp Verification',
        html:mail
    }

    try {                      // otp save in db and send mail
        const newOtp = new OTP({
            email:req.session.email,
            OTP:otp,
            createdAt:Date.now(),
            expaireAt:Date.now() + 60000
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
const insertUser = async (req,res)=>{
    try {

        if(req.body.email){
            const existingUser = await User.findOne({email: req.body.email})
            if(existingUser){
                console.log("Email id already taken")
            }
        }
        req.session.email=req.body.email

        const password = req.body.password
        const sPassword = await securePassword(password)
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:sPassword,
            is_block:0,
            is_verified:1,
            is_admin:0
        })

        req.session.userData = user
        console.log(req.session.userData)

        await sendOpt(req,res)
        res.redirect('/otp')


    } catch (error) {
        console.log(error.message);
    }
}

// otp page
const otp = async (req,res)=>{
    try {
        res.render('users/otp-verification.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

// verify Mail
const verifyOtp = async(req,res)=>{
    try {

        const {otp1,otp2,otp3,otp4} = req.body
        const otp = [otp1,otp2,otp3,otp4].join('')
        console.log(otp)

        const otpData = await OTP.findOne({email: req.session.email})
        console.log(otpData)

        console.log(typeof otp)
        if(otpData.OTP == otp){
            const userData = new User(req.session.userData)

            console.log(userData);
            await userData.save()

            await OTP.deleteOne({email: req.session.email})
            res.redirect("/login?message=verification is successfull")
        }
    } catch (error) {
        console.log(error.message)
    }
}

// login user page
const login = async (req, res) => {
    try {
        const message = req.query.message
        res.render('users/login.ejs',{message})
    } catch (error) {
        console.log(error.message)
    }
}

// verify login page
const verifyLogin  = async (req,res)=>{
    try {
        const email  = req.body.email
        const password = req.body.password
        console.log(req.body)
        const userData = await User.findOne({email:email})

        if (userData.is_block) {
            return res.render('users/login.ejs', {
                message: "User is blocked by Admin",
                userBlocked: true
            });
        }
        
        if(userData){
            console.log(userData);
            const passwordMatch = await bcrypt.compare(password,userData.password)

            if(passwordMatch){
                if(userData.is_verified == 0){
                    res.render('users/login.ejs');
                }else{
                    req.session.user_id  = userData._id
                    res.redirect('/')
                }
            }else{
                res.render('users/login.ejs',{message:"user email and password incorrect"})
            }
        }else{
            res.render('users/login.ejs',{message:"user email and password incorrect"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

//login Home
const loginHome = async (req,res)=>{
    try {
        const id = req.session.user_id
        const userData = await User.findById(id)
        const products = await Product.find({delete:false})
        const user = req.session.user_id
        console.log(user);
        res.render('users/indexLogout.ejs', {user:userData || 'muflih', products, user})
    } catch (error) {
        console.log(error.message)
    }
}

// user home page
// const home = async (req, res) => {
//     try {
//         res.render('users/index.ejs')
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).send('Internal Server Error');
//     }
// }

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
     login, register, insertUser, verifyLogin, loginHome, otp, verifyOtp, userLogout
}