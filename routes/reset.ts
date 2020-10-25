import express, { Errback, Request, Response } from "express";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";
import { decodeResetPasswordToken, IUserInfo } from "../util/jwtTokens";
const nodemailer = require("nodemailer");
const router = express.Router();

// @route   delete auth/forgot
// @desc    Logout user
// @access  Private
router.route("/:token").post((req: Request, res: Response) => {
  const { password } = req.body;
  const token = req.params.token;

  const decodedEmail = decodeResetPasswordToken(token);

  if (decodedEmail === null) {
    return res.status(400).json({ msg: "Token inválido!" });
  }

  bcrypt.genSalt(10, (err: Error, salt: string) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      const newPassword = hash;
      console.log(newPassword);
      console.log(token);
      User.findOneAndUpdate(
        { resetPasswordToken: token },
        { password: newPassword }
      )
        .then(() => {
          return res.status(200).json({
            msg: "Senha atualizada com sucesso!",
          });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Erro ao atualizar as informações do usuário.", err });
        });
    });
  });
});

module.exports = router;
