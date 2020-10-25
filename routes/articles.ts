import express, { Request, Response } from "express";
import Article, { IArticle } from "../models/article.model";
import Category from "../models/category.model";
import { auth } from "../middleware/auth";
import mongoose_fuzzy_search from "../typings/mongoose_fuzzy_search";
import { FilterQuery } from "mongoose";
import async from "async";

const router = express.Router();

// @route   GET articles
// @desc    Get visible and published articles
// @access  Public
router.route("/").get((req: Request, res: Response) => {
  // await removeUnsedFuzzyElements(Article, [
  //   "title",
  //   "description",
  //   "markdownArticle",
  // ]);
  // await updateFuzzy(Article, ["title", "description"]);

  //parameters for the query
  const limit = Number(req.query["limit"]) || 10;
  const page = Number(req.query["page"]) || 0;
  const search = req.query["search"] || "";
  const categories = req.query["category"] ? Array(req.query["category"]) : [];
  const state = "PUBLISHED";
  const visibility = "ALL";

  //setting the conditions
  let condition: FilterQuery<IArticle> = {};
  condition["$and"] = [{ state }, { visibility }];
  if (categories.length > 0)
    condition["$and"].push({ tags: { $all: categories } });

  Article.fuzzySearch(String(search), condition)
    .sort({ date: "desc" })
    .skip(page * limit)
    .limit(limit)
    .select("-markdownArticle")
    .then((articles) =>
      res
        .status(200)
        .json({ msg: `${articles.length} artigos encontrados.`, articles })
    )
    .catch((err) => res.status(400).json({ msg: err }));
});

// @route   GET articles/all
// @desc    Get all articles without restrictions
// @access  Public
router.route("/all").get(auth, (req: Request, res: Response) => {
  const limit = Number(req.query["limit"]) || 100;
  const page = Number(req.query["page"]) || 0;
  const search = req.query["search"] || "";
  const categories: Array<any> = req.query["category"]
    ? Array(req.query["category"])
    : [];
  const state: string =
    typeof req.query["state"] === "string" ? req.query["state"] : "";
  const visibility: string =
    typeof req.query["visibility"] === "string" ? req.query["visibility"] : "";

  let condition: FilterQuery<IArticle> = {};

  if (categories.length > 0 || state.length > 0 || visibility.length > 0)
    condition["$and"] = [];
  if (categories.length > 0)
    condition["$and"]?.push({ tags: { $all: categories } });
  if (state.length > 0) condition["$and"]?.push({ state });
  if (visibility.length > 0) condition["$and"]?.push({ visibility });

  Article.fuzzySearch(String(search), condition)
    .sort({ date: "desc" })
    .skip(page * limit)
    .limit(limit)
    .select("-markdownArticle")
    .then((articles) =>
      res.json({ msg: `${articles.length} artigos encontrados.`, articles })
    )
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
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
      return res.json({ msg: "Article added!" });
    })
    .catch((err) => {
      res.status(400).json({ msg: "Error: " + err });
    });
});

// @route   GET articles/:slug
// @desc    Get article
// @access  Public
router.route("/:slug").get((req: Request, res: Response) => {
  Article.findOne({ slug: req.params.slug })
    .then((article) =>
      res.json({ msg: `Artigo ${req.params.slug} encontrado!`, article })
    )
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
});

// @route   DELETE articles/:slug
// @desc    Delete article
// @access  Private
router.route("/:slug").delete(auth, (req: Request, res: Response) => {
  Article.findOneAndDelete({ slug: req.params.slug })
    .then((article) => {
      if (article !== null) {
        updateCategories([], article.tags);
        res.json({ mgs: "Article deleted." });
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// @route   POST articles/:slug
// @desc    Update article
// @access  Private
router.route("/:slug").post((req: Request, res: Response) => {
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
            res.json({ msg: "Article updated!" });
          })
          .catch((err) => res.status(400).json({ msg: "Error: " + err }));
      }
    })
    .catch((err) => res.status(400).json({ msg: "Error: " + err }));
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

// updateFuzzy(Article, ["title", "description", "markdownArticle"]);
const updateFuzzy = async (
  Model: mongoose_fuzzy_search.MongooseFuzzyModel<IArticle>,
  attrs: string[]
) => {
  for await (const doc of await Model.find()) {
    console.log(doc);
    const obj = attrs.reduce(
      (acc, attr) => ({ ...acc, [attr]: doc.get(attr) }),
      {}
    );
    await Model.findByIdAndUpdate(doc._id, obj);
    console.log(obj);
  }
};

const removeUnsedFuzzyElements = async (
  Model: mongoose_fuzzy_search.MongooseFuzzyModel<IArticle>,
  attrs: string[]
) => {
  for await (const doc of await Model.find()) {
    const $unset = attrs.reduce(
      (acc, attr) => ({ ...acc, [`${attr}_fuzzy`]: 1 }),
      {}
    );
    await Model.findByIdAndUpdate(
      doc._id,
      { $unset },
      { new: true, strict: false }
    );
  }
};
