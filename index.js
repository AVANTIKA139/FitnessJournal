const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
require("dotenv").config();
const path = require("path");
const verifyToken = require("./tokens/verifyToken");
const generateToken = require("./tokens/generateToken");

const { connectDB } = require("./connection/file");
const signupModel = require("./models/signup");

const { encrytPassword, verifyPassword } = require("./functions/encryption");
// const { sendLoginOtp, verifyOtp } = require("./functions/otp");

app.get("/public", (req, res) => {
  try {
    return res.json({ success: true, message: "Hello from the public api " });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
});
const checkIfUserLoggedIn = (req, res, next) => {
  if (verifyToken(req.cookies.auth_tk)) {
    const userinfo = verifyToken(req.cookies.auth_tk);
    req.userid = userinfo.id;
    next();
  } else {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }
};
app.get("/savedposts", checkIfUserLoggedIn, (req, res) => {
  try {
    let loggedId = req.userid;
    let notifications = {
      "65aaaa10b10198488ee3434": "Notificaiton 1",
      "65aaaa10b10198488e4546": "Notification 22",
      "65aaaa10b10198488ee3e12f": "Notification of logged in user",
      "65abff80c224b1a6dbdcf629": "Notification of new user",
    };
    return res.json({ success: true, message: notifications[loggedId] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
app.get("/getloggedinuser", checkIfUserLoggedIn, async (req, res) => {
  try {
    const loggedInuser = await USER_MODEL.findOne({ _id: req.userid });

    return res.json({ success: true, loggedInuser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
app.get("/chats", checkIfUserLoggedIn, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your chats" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/test", checkIfUserLoggedIn, (req, res) => {
  try {
    return res.json({ success: true, message: "Hello from the middleware" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const checksignup = await signupModel.findOne({
      email: req.body.email,
    });
    if (checksignup) {
      return res
        .status(400)
        .json({ success: false, error: "user already registered" });
    }
    const check1signup = await signupModel.findOne({
      name: req.body.username,
    });
    if (check1signup) {
      return res
        .status(400)
        .json({ success: false, error: "username already registered" });
    }
    const signup = new signupModel({
      email: req.body.email,
      password: await encrytPassword(req.body.password),
      name: req.body.username,

      dob: req.body.dob,
      phonenumber: req.body.phonenumber,
      isUnder18: req.body.isUnder18,
      gender: req.body.gender,
      weight: req.body.weight,
      height: req.body.height,
      medicalissues: req.body.medicalissues,
    });
    console.log(signup);
    const signupData = new signupModel(signup);
    await signupData.save();
    return res
      .status(200)
      .json({ success: true, message: "data saved successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// app.post("/login", (req, res) => {
//   try {
//     // console.log(req.body);

//     const userid = req.body.userid;
//     console.log(req.body);

//     if ((req.body.password = "database password")) {
//       const token = generateToken(userid);
//       console.log(token);
//       res.cookie("web_tk", token); //setting cookie
//       return res.json({ success: true, message: "Hello cookie generated" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Credentials" });
//     }
//   } catch (error) {
//     return res.status(400).json({ success: false, error: error.message });
//   }
// });
app.post("/login", async (req, res) => {
  try {
    let email = req.body.useremail;
    let inputpassword = req.body.userpassword;

    const checkuser = await signupModel.findOne({ email: email });
    if (!checkuser) {
      return res
        .status(400)
        .json({ success: false, error: "User not found ,please signup first" });
    }
    let originalpassword = checkuser.password;
    if (await verifyPassword(inputpassword, originalpassword)) {
      // sendLoginOtp(`+91${checkuser.phonenumber}`);
      // here we will do 2fa processs which we will send otp to the logged in user
      const token = generateToken(checkuser._id);
      console.log(token);
      res.cookie("auth_tk", token);
      return res.json({ success: true, message: "Logged in success" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect Password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
});
// app.post("/mfaverify", async (req, res) => {
//   try {
//     let email = req.body.useremail;
//     let inputpassword = req.body.userpassword;
//     let code = req.body.code;
//     const checkUser = await USER_MODEL.findOne({ email: email });
//     if (!checkUser) {
//       return res
//         .status(400)
//         .json({ success: false, error: "User not found, please signup first" });
//     }
//     let originalpassword = checkUser.password;

//     if (
//       (await verifyPassword(inputpassword, originalpassword)) &&
//       (await verifyOtp(`+91${checkUser.phonenumber}`, code))
//     ) {
//       const token = generateToken(checkUser._id);
//       res.cookie("auth_tk", token);
//       return res.json({ success: true, message: "Logged in success" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, error: "Incorrect credentials" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ success: false, error: error.message });
//   }
// });

app.get("/currentuser", checkIfUserLoggedIn, async (req, res) => {
  try {
    const userid = req.userid;
    const userdetails = await signupModel.findOne(
      { _id: userid },
      {
        email: 1,
        name: 1,
        dob: 1,
        phonenumber: 1,
        isUnder18: 1,
        gender: 1,
        weight: 1,
        height: 1,
        medicalissues: 1,

        createdAt: 1,
      }
    );
    if (userdetails) {
      return res.json({ success: true, data: userdetails });
    } else {
      return res.status(400).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});
const testMiddleWareFunction = (req, res, next) => {
  if (verifyToken(req.cookies.web_tk)) {
    const userinfo = verifyToken(req.cookies.web_tk);
    console.log("hi this is middleware function");
    console.log(userinfo);
    next();
  } else {
    return res.status(400).json({ success: false, error: "UNAUTHORIZED" });
  }
};
app.get("/profile", testMiddleWareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your profile" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/history", testMiddleWareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your friends" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/chats", testMiddleWareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your chats" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/test", testMiddleWareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "Hello from the middleware" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
app.get("/logout", (req, res) => {
  try {
    res.clearCookie("auth_tk");
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname + "/client/build/index.html"),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
});
connectDB();
app.listen(port, () => console.log("Server is running at Port", port));
// Cookies are small files of information (encrypted long string of token) that a web server(backend)
//  generates (while logging) and sends to a web browser (frontend).
//  Web browsers store the cookies they receive for a predetermined period of time,
//   or for the length of a user's session on a website.
//    They attach the relevant cookies to any future requests the user makes of the web server.

// Cookies are help in authenticating whether the user is logged in or not
// Cookies not only authenticate the user but also stores the details about the current user
// because using these details from the cookies, the backend server send the respective data.

// A middleware is a function which runs in between the request and response cycle.
// This middleware function contains three arguments
// which are request and response objects, along with next argument
// Next argument is responsible for further processing of response
// operation
