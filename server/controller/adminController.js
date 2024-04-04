import Admin from "../model/adminModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js"
// ----------------------------------------------

//admin login page
const adminLogin = async(req,res)=>{
    try {
        res.render('admin/login.ejs')
    } catch (error) {
        console.log(error.message)
    }
}

//admin register page
const adminRegister = async(req,res)=>{
    try {
        res.render('admin/adminRegister.ejs');
    } catch (error) {
        console.log(error.message)
    }
}

//registration admin details
const insertAdmin = async(req,res)=>{
    try {
        const admin = new Admin({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
        })

        console.log(admin)

        await admin.save();
        res.redirect('/admin')


    } catch (error) {
        console.log(error.message);
    }
}

//verify admin login
const verifyAdminLogin = async(req,res)=>{
    try {
        
        const { email,password } = req.body

        const adminData = await Admin.findOne({ email:email })

        if(adminData){
            if(adminData.email === email && adminData.password === password){
                req.session.admin_id = adminData._id
                console.log(req.session.admin_id);
                res.redirect('/admin/home')
            }else{
                console.log("ook da kuttu");
                res.render('admin/login.ejs',{error : "invalid username and password"})
            }
        }else{
            console.log('no user data');
            res.render('/admin/login.ejs');
        }

    } catch (error) {
        console.log(error.message)
    }
}

//admin home page
const adminHome = async (req,res)=>{
    try {
        const adminData = await Admin.findById({_id:req.session.admin_id});
        res.render('admin/index.ejs',{admin:adminData})
    } catch (error) {
        console.log(error.message)
    }
}

// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------





export {
    adminHome, adminLogin, adminRegister, insertAdmin, verifyAdminLogin
}