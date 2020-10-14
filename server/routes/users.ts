import express from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";
import { IUserInfo } from "../util/jwtTokens";
import RefreshToken from "../models/refreshToken.model";
import userModel from "../models/user.model";

const router = express.Router();

// @route   POST users
// @desc    Register new user
// @access  Private
router.route("/").post(auth, (req, res) => {
  if (req.body.user.role !== "ADMIN")
    return res.status(401).json({ msg: "Usuário não autorizado." });
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ msg: "Por favor, preencha todos os campos" });

  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "Email já cadastrado." });

    const newUser = new User({
      name,
      email,
      password,
      role: "EDITOR",
    });

    bcrypt.genSalt(10, (err: Error, salt: string) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        newUser
          .save()
          .then((user) => {
            const userDecoded: IUserInfo = {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
            res.status(200).json({ user: userDecoded });
          })
          .catch((err) => res.status(400).json({ msg: "Error: " + err }));
      });
    });
  });
});

// @route   POST users
// @desc    Register new user
// @access  Private
router.route("/:email").post(auth, (req, res) => {
  const email = req.params.email;

  if (email !== req.body.user.email)
    return res
      .status(400)
      .json({ msg: "Sem permissão necessária para alterar esse usuário." });

  // if (req.body.user.email !== email)
  //   return res.status(401).json({ msg: "User not Authorized." });
  const { name, password } = req.body;

  if (!name || !password)
    return res.status(400).json({ msg: "Por favor, preencha todos os campos" });

  bcrypt.genSalt(10, (err: Error, salt: string) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      const newPassword = hash;

      User.findOneAndUpdate({ email }, { name, password: newPassword })
        .then(() => {
          RefreshToken.remove({ user_id: req.body.user.id });
          return res.status(200).json({
            msg: "Dados do usuário atualizados com sucesso!",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .json({ msg: "Erro ao atualizar as informações do usuário.", err });
        });
    });
  });
});

module.exports = router;
