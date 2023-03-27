const express = require("express");
const { connection } = require("./config/db");
const { client } = require("./config/redis");
const { usermodel } = require("./model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auth } = require("./middleware/auth");
const { validation } = require("./middleware/authorise");
const { weathermodel } = require("./model/weather");
const winston = require("winston");
const expresswinston = require("express-winston");

const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(
  expresswinston.logger({
    transports: [
      new winston.transports.Console({
        level: "info",
        json: true,
      }),
      new winston.transports.File({
        level: "info",
        json: true,
        filename: "logs.log",
      }),
    ],
    format: winston.format.json(),
  })
);
app.get("/", (req, res) => {
  res.send("hello from db");
});

app.post("/signup", async (req, res) => {
  let { name, mail, pass } = req.body;
  try {
    bcrypt.hash(pass, 5, async function (err, hash) {
      if (err) {
        res.send("can't add user");
        console.log(err.message);
      } else {
        let newuser = new usermodel({ name, mail, pass: hash });
        let X = await newuser.save();
        console.log(X);
        res.send("user is added");
      }
    });
  } catch (err) {
    res.send("cant add user");
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  let { mail, pass } = req.body;
  try {
    let user = await usermodel.findOne({ mail });
    if (!user) {
      res.send("signup first");
    }
    bcrypt.compare(pass, user.pass, function (err, result) {
      if (result == true) {
        let token = jwt.sign({ userid: user._id }, process.env.normal);
        let refreshtoken = jwt.sign({ userid: user._id }, process.env.refresh);

        res.send({ token, refreshtoken });
      }
    });
  } catch (err) {
    res.send("signup first");
    console.log(err);
  }
});

app.get("/logout", async (req, res) => {
  let token = req.headers.authorization?.split(" ")[1];
  await client.lPush("blacklist", token);
  res.send("user logged out");
});

app.get("/forcast/:city", auth, validation, async (req, res) => {
  let city = req.params.city;
  let rdata = await client.exists(city);
  if (rdata) {
    let main = await client.get(city);
    res.send(main);
  } else {
    let weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=2b30bebb41ba858e2bfd22f1ede5cf0e`
    );
    let obj = weather.data;

    try {
      let weth = new weathermodel(obj);
      let W = await weth.save();
      await client.SETEX(city, 1800, JSON.stringify(W));

      res.send(W);
    } catch (err) {
      console.log(err);

      res.send("ok");
    }
  }
});

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log(`connected to DB at port : ${process.env.port}`);
  } catch (err) {
    console.log("can't connect");
    console.log(err);
  }
});

// https://api.openweathermap.org/data/2.5/weather?q=ratangarh&appid=2b30bebb41ba858e2bfd22f1ede5cf0e
