import multer from "../middleware/multer";
import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import { compressImage } from "../util/fileHelper";
import ImagePath, { IImagePath } from "../models/imagePath.model";
import path from "path";
import fs from "fs";

const router = express.Router();

// @route   GET images/
// @desc    Get an array of all images
// @access  Private
router.route("/").get(auth, (req: Request, res: Response) => {
  const directoryPath = "./public/images/";
  const resolvedPath = path.resolve(directoryPath);
  fs.readdir(resolvedPath, (err, files) => {
    if (err) {
      console.log(err);
      return res.status(404).json("Couldn't read images directory");
    }
    const imagesFiltered = files.filter((value) => value !== ".gitkeep");
    res.status(200).json(
      imagesFiltered.map(
        (value) => `${req.protocol}://${req.get("host")}/images/${value}`
      )
      // imagesFiltered.map((value) => {
      //   return {
      //     path: `${req.protocol}://${req.get("host")}/images/${value}`,
      //   };
      // })
    );
  });
});

// @route   POST images/
// @desc    Save new image on file-system
// @access  Private
router
  .route("/")
  .post(multer.single("image"), auth, (req: Request, res: Response) => {
    console.log("req.body", req.body);
    if (!req.file) return res.status(400).json("Error on file upload.");
    const size = parseInt(req.body.size);
    compressImage(req.file, size)
      .then((newPath) => {
        const url = `${req.protocol}://${req.get("host")}/images/${newPath}`;
        console.log(req.body.user);
        const newImagePath: IImagePath = new ImagePath({
          path: newPath,
          url: url,
          articles: [],
          tags: [],
          user: req.body.user.id,
        });
        newImagePath
          .save()
          .then(() =>
            res.status(201).json({
              path: newPath,
              url: url,
              articles: [],
              tags: [],
              user: req.body.user.id,
            })
          )
          .catch((err) => {
            console.log(err);
            return res.status(500).json("Error on file processing.");
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json("Error on file processing.");
      });
  });

// @route   DELETE images/:fileName
// @desc    Remove image from file-system
// @access  Private
router.route("/:fileName").delete(auth, (req: Request, res: Response) => {
  console.log(req);
  const filePath = `./public/images/${req.params.fileName}`;
  const resolvedPath = path.resolve(filePath);
  console.log(resolvedPath);
  fs.unlink(resolvedPath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json("File not deleted.");
    }
    res.status(204).json(`file ${req.params.fileName} deleted.`);
  });
});

module.exports = router;
