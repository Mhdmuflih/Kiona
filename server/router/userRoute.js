import express from "express";
import { home,login,register } from "../controller/userController.js";

const user_route = express();

user_route.get('/',home)

user_route.get('/login',login)


user_route.get('/register',register)

export default user_route


