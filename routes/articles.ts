import express, { Request, Response } from "express";
import Article from "../models/article.model";
import Category from "../models/category.model";
import { auth } from "../middleware/auth";
import async from "async";

const router = express.Router();

// @route   GET articles
// @desc    Get all articles
// @access  Public
router.route("/").get((req: Request, res: Response) => {
  Article.find()
    .find({ $and: [{ state: "PUBLISHED" }, { visibility: "ALL" }] }) //Return Published and Visible to all
    .sort({ date: "desc" })
    .limit(20)
    .select("-markdownArticle")
    .then((articles) => res.json(articles))
    .catch((err) => res.status(400).json("Error: " + err));
});

// @route   POST articles
// @desc    Add new article
// @access  Private
router.route("/").post(auth, (req: Request, res: Response) => {
  const {
    title,
    description,
    markdownArticle,
    author,
    state,
    visibility,
  } = req.body;
  const date = req.body.date ? Date.parse(String(req.body.date)) : new Date();
  const tags = req.body.tags
    ? req.body.tags.map((tag: string) => tag.toUpperCase())
    : [];
  //const imgUrl = req.file.filename;

  const newArticle = new Article({
    title,
    description,
    markdownArticle,
    date,
    tags,
    author,
    state,
    visibility,
    //previewImg: imgUrl
  });

  newArticle
    .save()
    .then(() => {
      updateCategories(tags);
      return res.json("Article added!");
    })
    .catch((err) => {
      res.status(400).json("Error: " + err);
    });
});

// @route   GET articles/:slug
// @desc    Get article
// @access  Public
router.route("/:slug").get((req: Request, res: Response) => {
  Article.findOne({ slug: req.params.slug })
    .then((article) => res.json(article))
    .catch((err) => res.status(400).json("Error: " + err));
});

// @route   DELETE articles/:slug
// @desc    Delete article
// @access  Private
router.route("/:slug").delete(auth, (req: Request, res: Response) => {
  Article.findOneAndDelete({ slug: req.params.slug })
    .then((article) => {
      if (article !== null) {
        updateCategories([], article.tags);
        res.json("Article deleted.");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// @route   POST articles/update/:slug
// @desc    Update article
// @access  Private
router.route("/update/:slug").post((req: Request, res: Response) => {
  Article.findOne({ slug: req.params.slug })
    .then((article) => {
      if (article !== null) {
        const oldTags = article.tags;
        const newTags = req.body.tags.map((tag: string) => tag.toUpperCase());

        article.title = req.body.title;
        article.description = req.body.description;
        article.markdownArticle = req.body.markdownArticle;
        article.date = new Date(Date.parse(req.body.date));
        article.tags = req.body.tags.map((tag: string) => tag.toUpperCase());
        article.author = req.body.author;

        article
          .save()
          .then(() => {
            updateCategories(newTags, oldTags);
            res.json("Article updated!");
          })
          .catch((err) => res.status(400).json("Error: " + err));
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;

async function updateCategories(
  newTags: Array<string>,
  oldTags: Array<string> = []
) {
  const tagsToUpdate: Array<{ tag: string; ammount: number }> = [];

  newTags.forEach((newTag) => {
    if (!oldTags.includes(newTag))
      tagsToUpdate.push({
        tag: newTag,
        ammount: 1,
      });
  });

  oldTags.forEach((oldTag) => {
    if (!newTags.includes(oldTag))
      tagsToUpdate.push({
        tag: oldTag,
        ammount: -1,
      });
  });

  await async.each(tagsToUpdate, (tagToUpdate, callback) => {
    const name = tagToUpdate.tag;

    Category.findOne({ name })
      .then((category) => {
        if (category)
          Category.findOneAndUpdate(
            { name },
            { $inc: { posts_count: tagToUpdate.ammount } }
          ).catch((err) => console.log("Error: " + err));
        else {
          const newCategory = new Category({
            name: name,
            posts_count: tagToUpdate.ammount,
          });

          newCategory.save().catch((err) => console.log("Error: " + err));
          console.log(name);
        }
      })
      .catch((err) => console.log("Error: " + err));
  });
  return "success";
}
