import express from "express";
import dotenv from "dotenv";
import path from "path";

import userRoute from "./server/router/userRoute.js"

// -----------------------------------------------------------------------


dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname, 'assets')))
app.set('views', path.join(__dirname, 'views'));

// -----------------------------------------------------------------------

app.use('/',userRoute);

// -----------------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is starting.. http://localhost:${PORT}`);
});

// -----------------------------------------------------------------------