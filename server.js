import express from "express";
import dotenv from "dotenv";
import path from "path";

// -----------------------------------------------------------------------

import connectDB from "./server/database/connection.js";
import userRoute from "./server/router/userRoute.js"
import adminRoute from "./server/router/adminRoute.js"

// -----------------------------------------------------------------------

//dotenv
dotenv.config();

// mongodb connection
connectDB();


const app = express();                                          //express adding
const __dirname = path.resolve();                               //pth setting

app.use(express.json())
app.use(express.urlencoded({extended:true}))                    //change the json format of url
app.set('view engine','ejs')                                    //page converting to dynamic or to take the ejs access

app.use(express.static(path.join(__dirname, 'assets')))         //assets is public field
app.set('views', path.join(__dirname, 'views'));

// -----------------------------------------------------------------------

//user route
app.use('/',userRoute);

// -----------------------------------------------------------------------

// admin route
app.use('/admin',adminRoute)

// -----------------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is starting.. http://localhost:${PORT}`);
});

// -----------------------------------------------------------------------


