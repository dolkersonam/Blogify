require('dotenv').config()

const path = require("path");
const express = require("express");
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");


const Blog = require('./models/blogs');

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { create } = require("./models/user");

const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')))

app.use((req, res, next) => {
    res.locals.user = req.user; 
    next();
});
mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB Connected"));

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home" , {
        user : req.user,
        blogs : allBlogs,
    });
})

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));

