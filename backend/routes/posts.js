const express = require("express");

const PostController = require("../controllers/posts");
const extractFile = require("../middlewares/file");
const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router.post("", checkAuth, extractFile, PostController.createPost);
router.put("/:id", checkAuth, extractFile, PostController.updatePostById);
router.get("", PostController.getPosts);
router.get("/:id", PostController.getPostById);
router.delete("/:id", checkAuth, PostController.deletePostById);
router.all("*", (req, res, next) => {
  res.status(404).json({ message: "Route not found!" });
});

module.exports = router;
