import express from "express";
import { home,login } from "../controller/userController.js";

const user_route = express();

user_route.get('/',home)

user_route.get('/login',login)

export default user_route


