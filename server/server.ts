import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
const nodemailer = require("nodemailer");
// const rateLimiterMiddleware = require("./middleware/rateLimiter");

//environment variables
// require("dotenv").config();
import "dotenv/config";

//express server
const app = express();
const port = process.env.port || 5000;

const sendTestMail = async () => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: testAccount.user, // generated ethereal user
  //     pass: testAccount.pass, // generated ethereal password
  //   },
  // });

  const mailHost = process.env.MAIL_HOST;
  const mailPort = process.env.MAIL_PORT || 465;
  const mailSecure = Boolean(process.env.MAIL_SECURE);
  const mailUser = process.env.MAIL_AUTH_USER;
  const mailPassword = process.env.MAIL_AUTH_PASSWORD;

  let transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure, // true for 465, false for other ports
    auth: {
      user: mailUser, // generated ethereal user
      pass: mailPassword, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "wellingtonmassola@gmail.com, wellingtonmassola@outlook.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou.
};

// sendTestMail();

//middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", //frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public")); //folder public so user can receive the images
// app.use(rateLimiterMiddleware);

// const uri = process.env.ATLAS_URI;
const uri = process.env.MONGO_URI;
if (uri) {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
  });

  // const categoriesRouter = require("./routes/categories");
  app.use("/articles", require("./routes/articles"));
  app.use("/users", require("./routes/users"));
  app.use("/auth", require("./routes/auth"));
  app.use("/images", require("./routes/images"));
  app.use("/categories", require("./routes/categories"));
  app.use("/reset", require("./routes/reset"));

  //start listening
  app.listen(port, () => {
    console.log(`server is running on port:  ${port}`);
  });
}
