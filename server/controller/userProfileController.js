import User from "../model/userModel.js";
import Address from "../model/addressModel.js";

import bcrypt, { compare } from "bcrypt";
import axios from "axios";

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
        
        const id = req.body.user_id

        await User.findByIdAndUpdate({ _id:id}, { $set: { name:req.body.name, email:req.body.email, mobile:req.body.mobile } })

        const userData = await User.findById({ _id:id })

        res.render('users/Profile/userProfile.ejs',{ user:userData, message:"Profile Updated" })

        // if(response){
        //     res.json({success:true, message:"User details Updated"})
        // }else{
        //     res.json({success:false, message:"Server Error"})
        // }

    } catch (error) {
        console.log(error.message);
    }
}

//user Password Changing Page
const passwordChangePage = async (req,res)=>{
    try {
     
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })
    
        res.render('users/Profile/userPasswordManagement.ejs',{user, message:req.query.message})
        
    } catch (error) {
        console.log(error.message);
    }
}

//user Password Update
const updatePassword = async(req,res)=>{
    try {

        const { id, password, password1, password2 } = req.body
        const userData = await User.findOne({ _id:id })
        const passwordMatch = await bcrypt.compare(password,userData.password)

        if(!passwordMatch){
            return res.render('users/Profile/userPasswordManagement.ejs', { user:userData,  message:"Your Password is not Match" })
        }
        if(password1 !== password2){

            return res.render('users/Profile/userPasswordManagement.ejs', { user:userData, message:"Your New Password is not Match" })
        }
        
        const sPassword = await securePassword(password1)
        await User.updateOne({_id:id},{ $set: { password:sPassword } })

        res.render('users/Profile/userPasswordManagement.ejs',{ user:userData, message:"Password Updated" })
        
    } catch (error) {
        console.log(error.message);
    }
}

//user Address Management Page
const addressPage = async(req,res)=>{
    try {
        
        const id = req.session.user_id
        const user = await User.findOne({ _id:id })

        res.render('users/Profile/userAddressManagement.ejs',{ user })

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
        console.log('kooii kittnillee');
        const id = req.session.user_id;
        console.log(id,'koooi');

        console.log(req.body);

        const address = new Address({
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
                    defaultAddress: req.body.defaultAddress || false
                }
            ]
        })
        console.log(req.body);
        console.log(address,'looo');
        const saveAddress = await address.save();
        console.log(saveAddress);

        if(saveAddress){
            res.json({success:true, message:"Address Added "})
        }else{
            res.json({success:false, message:"Add Address Failed"})
        }

    } catch (error) {
        console.log(error);
    }
}

export {
    profilePage,
    passwordChangePage,
    addressPage,

    addAddressPage,
    addAddress,

    updateProfile,
    updatePassword
}