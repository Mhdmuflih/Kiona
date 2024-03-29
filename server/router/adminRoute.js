import express from "express"
import { adminHome,userDetails } from "../controller/adminController.js";

const admin_route = express();

admin_route.get('/',adminHome)
admin_route.get('/users',userDetails);

export default admin_route;