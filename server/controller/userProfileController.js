import User from "../model/userModel.js";
import Address from "../model/addressModel.js";

import bcrypt from "bcrypt";


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
 
        const addressData = await Address.findOneAndUpdate({"addresses._id":addressId},{$set:update})

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
    }
}


export {
    profilePage,
    passwordChangePage,

    addressPage,
    deleteAddress,

    editAddresPage,
    editAddress,

    addAddressPage,
    addAddress,

    updateProfile,
    updatePassword
}