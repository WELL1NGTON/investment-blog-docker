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
  const limit = Number(req.query["limit"]) || 10;
  const page = Number(req.query["page"]) || 0;
  const tags: Array<any> = req.query["tag"] ? Array(req.query["tag"]) : [];

  let condition: { [k: string]: any } = {};
  if (tags.length > 0 || tags.length > 0 || tags.length > 0)
    condition["$and"] = [];

  ImagePath.find(condition)
    .sort({ createdAt: "desc" })
    .skip(page * limit)
    .limit(limit)
    .then((images) => {
      res.status(200).json({
        msg: `${images.length} imagens encontradas.`,
        images,
      });
    })
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
});

// @route   POST images/
// @desc    Save new image on file-system
// @access  Private
router
  .route("/")
  .post(multer.single("image"), auth, (req: Request, res: Response) => {
    if (!req.file)
      return res.status(400).json({ msg: "Erro no upload do arquivo." });
    const size = req.body.size ? parseInt(req.body.size) : null;

    const tags = req.body.tags
      ? req.body.tags.map((tag: string) => tag.toUpperCase())
      : [];

    compressImage(req.file, size)
      .then((newPath) => {
        const newFileName = newPath.replace(/^.*[\\\/]/, "");
        const url = `${req.protocol}://${req.get(
          "host"
        )}/images/${newFileName}`;
        const newImagePath: IImagePath = new ImagePath({
          name: newFileName,
          path: newPath,
          url: url,
          articles: [],
          tags,
          user: req.body.user.id,
        });
        newImagePath
          .save()
          .then(() =>
            res.status(201).json({
              name: newFileName,
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
  const fileName = req.params.fileName;
  const filePath = `./public/images/${fileName}`;
  const resolvedPath = path.resolve(filePath);
  ImagePath.deleteOne({ name: fileName })
    .then(() => {
      fs.unlink(resolvedPath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ msg: "File not deleted." });
        }
        return res.status(200).json({ msg: `file ${fileName} deleted.` });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ msg: "File not deleted." });
    });
});

module.exports = router;
