import multer from "multer";
import { Request } from "express";

// module.exports = multer({
export default multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, "./public/images");
    },

    filename: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const isAccepted = ["image/png", "image/jpg", "image/jpeg"].find(
      (formatoAceito) => formatoAceito == file.mimetype
    );
    if (isAccepted) {
      return cb(null, true);
    }
    return cb(null, false);
  },
});
