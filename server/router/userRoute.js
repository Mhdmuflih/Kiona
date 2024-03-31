import express from "express";
import multer from "multer";// multer is using in take a image store
import path from "path";
import session from "express-session";

import { home,login,register,insertUser,verifyLogin,loginHome,verifyMail } from "../controller/userController.js";
// -----------------------------------------------------------------------

const user_route = express();   //express connection
// ---------------------------

const __dirname = path.resolve()  //to take the dirname(directery name) path in this new feature

//session working code
user_route.use(session({
    secret:'allisWell',
    resave:false,
    saveUninitialized:false
}))

user_route.use(express.static('assets'))

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
user_route.get('/',home)

// register route
user_route.get('/register',register)
user_route.post('/register',upload.single('image'),insertUser)

// verifyMail route
user_route.get('/verify',verifyMail)

// login route
user_route.get('/login',login)
user_route.post('/login',verifyLogin)

//login Home
user_route.get('/home',loginHome)


export default user_route


