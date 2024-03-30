import bcrypt from "bcrypt";
import User from "../model/userModel.js"

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
        const password = req.body.password
        const sPassword = await securePassword(password)
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:sPassword,
            is_admin:0
        })

        const userData = user.save()

        if(userData){
            res.render('users/registration',{message:"Your Registration has been Successful... verify your Email"});
        }else{
            res.render('users/registration',{message:"Your Registration has been Failed"})
        }

    } catch (error) {
        console.log(error.message);
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
    home, login, register, insertUser, verifyLogin, loginHome
}