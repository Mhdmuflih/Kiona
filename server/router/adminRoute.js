import express from "express"
import { adminHome,userDetails,adminLogin, adminRegister, insertAdmin, verifyAdminLogin } from "../controller/adminController.js";

const admin_route = express();

admin_route.get('/',adminHome)
admin_route.get('/users',userDetails);

admin_route.get('/login',adminLogin)
admin_route.post('/login',verifyAdminLogin)

admin_route.get('/register',adminRegister)
admin_route.post('/register',insertAdmin)

export default admin_route;