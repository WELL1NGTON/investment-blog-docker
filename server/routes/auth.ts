import express, { Errback, Request, Response } from "express";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  IUserInfo,
} from "../util/jwtTokens";

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
    .then((user) => res.json({ user }))
    .catch((err) => res.status(400).json("Error: " + err));
});

// @route   delete auth/logout
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
        .json({ success: true })
    )
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
