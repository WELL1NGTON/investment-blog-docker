import express, { Request, Response } from "express";
import Category from "../models/category.model";

const router = express.Router();

// @route   GET categories
// @desc    Get all categories
// @access  Public
router.route("/").get((req: Request, res: Response) => {
  Category.find({ visible: true })
    .sort({ createdAt: "desc" })
    .then((categories) =>
      res.json({
        msg: `${categories.length} categorias encontradas.`,
        categories,
      })
    )
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
});

// // @route   POST categories
// // @desc    Add new category
// // @access  Private
// router.route("/add").post((req, res) => {
//   const name = req.body.name;
//   const posts_count = req.body.posts_count;
//   const last_entry = req.body.last_entry;
//   const visible = req.body.visible;

//   const newCategory = new Category({
//     name,
//     posts_count,
//     last_entry,
//     visible,
//   });

//   newCategory
//     .save()
//     .then(() => res.json("Category added!"))
//     .catch((err) => res.status(400).json("Error: " + err));
// });

// // @route   GET categories/:slug
// // @desc    Get category
// // @access  Public
// router.route("/:slug").get((req, res) => {
//   Category.findOne({ slug: req.params.slug })
//     .then((category) => res.json(category))
//     .catch((err) => res.status(400).json("Error: " + err));
// });

// // @route   DELETE categories/:slug
// // @desc    Delete category
// // @access  Private
// router.route("/:slug").delete((req, res) => {
//   Category.findOneAndDelete({ slug: req.params.slug })
//     .then(() => res.json("Category deleted."))
//     .catch((err) => res.status(400).json("Error: " + err));
// });

// // @route   POST categories/:slug
// // @desc    Update category
// // @access  Private
// router.route("/update/:slug").post((req, res) => {
//   Category.findOne({ slug: req.params.slug })
//     .then((category) => {
//       category.title = req.body.title;
//       category.description = req.body.description;
//       category.markdownArticle = req.body.markdownArticle;
//       category.date = Date.parse(req.body.date);
//       category.tags = req.body.tags.map((tag) => tag.toUppterCase());
//       category.author = req.body.author;

//       category
//         .save()
//         .then(() => res.json("Category updated!"))
//         .catch((err) => res.status(400).json("Error: " + err));
//     })
//     .catch((err) => res.status(400).json("Error: " + err));
// });

module.exports = router;
