import express from "express"
import { adminHome,userDetails,adminLogin, adminRegister, insertAdmin, verifyAdminLogin, userBlock } from "../controller/adminController.js";

const admin_route = express();

admin_route.get('/home',adminHome)

admin_route.get('/users',userDetails);
admin_route.post('/block_user',userBlock)

admin_route.get('/',adminLogin)
admin_route.post('/',verifyAdminLogin)

admin_route.get('/register',adminRegister)
admin_route.post('/register',insertAdmin)

export default admin_route;