import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./server/database/connection.js";


import userRoute from "./server/router/userRoute.js"
import adminRoute from "./server/router/adminRoute.js"

// -----------------------------------------------------------------------

//dotenv
dotenv.config();

// mongodb connection
connectDB();


const app = express();
const __dirname = path.resolve();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname, 'assets')))
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


