const express = require("express");
const app = express();
const cors = require("cors");
const userApi = require("./routes/user");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./conn/conn");
app.use(express.json());

//cookie parser
app.use(cookieParser());

//body parser
app.use(
  cors({
    origin: ["http://localhost:5173", "https://inscribelog.netlify.app"],
    credentials: true,
  })
);

//routes
app.use("/api/v1", userApi);

//server listening
app.listen(process.env.PORT, () => {
  console.log(`Server started at port : ${process.env.PORT}`);
});
