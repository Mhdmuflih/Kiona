import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import User from "../model/userModel.js";
import OTP from "../model/otpModel.js";

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

const OtpGenerator = ()=>{
    return Math.floor(1000 + Math.random() * 9000)
}

const sendOpt = async (req,res)=>{

    let otp = OtpGenerator();
    console.log(otp);

    const transporter = nodemailer.createTransport({
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

    const response = {
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

    const message = {
        from:process.env.AUTH_EMAIL,
        to:req.session.email,
        subject:'KIONA otp Verification',
        html:mail
    }

    try {
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
        console.log(error.message,'asdfghjk')
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

        // if(req.body.email){
        //     const existingUser = await User.findOne({email: req.body.email})
        //     if(existingUser){
        //         console.log("Email id already taken")
        //     }
        // }
        req.session.email=req.body.email
        console.log('fhgj');

        const password = req.body.password
        const sPassword = await securePassword(password)
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.body.filename,
            password:sPassword ,
            is_admin:0
        })

        req.session.userData = user
        console.log(req.session.userData)

        await sendOpt(req,res)
        return res.send('hiii')
        // await sendOtpMail(req,res)


        // const userData = user.save()

        // if(userData){
        //     // sendVerifyMail(req.body.name, req.body.email, userData._id);
        //     res.render('users/registration',{message:"Your Registration has been Successful... verify your Email"});
        // }else{
        //     res.render('users/registration',{message:"Your Registration has been Failed"})
        // }

    } catch (error) {
        console.log(error.message);
    }
}

// verifyMail
const verifyMail = async (req,res)=>{
    try {
        
        const updatedInfo = await User.updateOne({_id:req.body.id},{ $set:{is_verified: 1} })
        console.log(updatedInfo)
        res.render('users/email-verified.ejs')

    } catch (error) {
        console.log(error.message)
    }
}


// login user page
const login = async (req, res) => {
    try {
        res.render('users/login.ejs')
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

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('users/login.ejs');
                }else{
                    req.session.user_id  = userData._id
                    res.redirect('/home')
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
        res.render('users/index.ejs', {user:userData || 'muflih'})
    } catch (error) {
        console.log(error.message)
    }
}






const home = async (req, res) => {
    try {
        res.render('users/index.ejs')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}





export {
    home, login, register, insertUser, verifyLogin, loginHome,verifyMail
}