import express from "express";
import { home } from "../controller/UserController.js";

const user_route = express();

user_route.get('/',home)

export default user_route


