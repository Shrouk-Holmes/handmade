const express = require('express')
const connectToDB = require("./config/connectToDB.js");

require("dotenv").config()
connectToDB()
const app = express();
app.use(express.json());
 

app.use(express.json());


app.use("/api/jobs", require("./routes/jobRoute.js"));
app.use("/api/posts", require("./routes/postRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));

const PORT = process.env.PORT ||3000
app.listen(PORT, () => 
    console.log(
        `server is runningin ${process.env.NODE_ENV} mode on port ${PORT}`
     )
);