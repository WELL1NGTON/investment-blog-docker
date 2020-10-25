import express, { Errback, Request, Response } from "express";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  IUserInfo,
} from "../util/jwtTokens";
const nodemailer = require("nodemailer");
const router = express.Router();

// @route   POST auth/
// @desc    Auth user (login)
// @access  Public
router.route("/").post((req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Por favor, preencha todos os campos" });

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "Usuário não existe." });

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "invalid credentials" });
      const userInfo: IUserInfo = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      const accessToken = generateAccessToken(userInfo);
      const refreshToken = generateRefreshToken(userInfo);

      const newRefreshToken = new RefreshToken({
        user_id: user.id,
        token: refreshToken,
      });
      newRefreshToken.save();

      res
        .cookie("access-token", accessToken, { httpOnly: true })
        .cookie("refresh-token", refreshToken, { httpOnly: true })
        .json({
          msg: "Usuário autenticado com sucesso!",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    });
  });
});

// @route   get auth/
// @desc    Auth user
// @access  Private
router.route("/").get(auth, (req: Request, res: Response) => {
  const user = req.body.user;
  User.findById(user.id)
    .select("-password")
    .then((user) =>
      res.json({ msg: `Usuário ${user?.name} está logado.`, user })
    )
    .catch((err) => res.status(401).json({ msg: "Error: " + err }));
});

// @route   delete auth/
// @desc    Logout user
// @access  Private
router.route("/").delete(auth, (req: Request, res: Response) => {
  const refreshToken = req.cookies["refresh-token"];
  const logoutOption = req.body.logoutOption;
  if (typeof refreshToken !== "string")
    return res.status(401).json({ msg: "No token, user not loged" });
  RefreshToken.findOneAndDelete({ token: refreshToken })
    .then(() =>
      res
        .clearCookie("refresh-token")
        .clearCookie("access-token")
        .status(200)
        .json({ msg: "Usuário desautenticado com sucesso!", success: true })
    )
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
});

// @route   delete auth/forgot
// @desc    Logout user
// @access  Private
router.route("/forgot").post((req: Request, res: Response) => {
  const { email } = req.body;

  const resetPasswordToken = generateResetPasswordToken(email);

  User.findOneAndUpdate({ email }, { resetPasswordToken }).then(
    async (value) => {
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

      const resetLink = `http://localhost:3000/reset/${resetPasswordToken}`;
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"InvestmentBlog " <foo@example.com>', // sender address
        to: email, // list of receivers
        subject: "Password Recovery", // Subject line
        text: `Password recovery token is ${resetLink}`, // plain text body
        html: `<b>Password recovery token is <a href="${resetLink}">${resetLink}</a></b>`, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou.
    }
  );
});

module.exports = router;
