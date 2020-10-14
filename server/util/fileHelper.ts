import fs from "fs";
import sharp from "sharp";

const compressImage = (file: Express.Multer.File, size: number) => {
  const newPath = file.path.split(".")[0] + ".jpg";
  return sharp(file.path)
    .resize(size)
    .toFormat("jpg")
    .jpeg({ quality: 80 })
    .toBuffer()
    .then((data) => {
      fs.access(file.path, (err) => {
        if (!err) {
          console.log(file.path);
          fs.unlink(file.path, (err) => {
            if (err) console.log(err);
          });
        } else {
          console.log(err);
        }
        fs.writeFile(newPath, data, (err) => {
          if (err) {
            throw err;
          }
        });
      });

      return newPath;
    });
};

export { compressImage };
