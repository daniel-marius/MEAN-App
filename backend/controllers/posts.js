const Post = require("../models/post.model");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post added!",
        post: {
          ...result,
          id: result._id,
        },
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "Creating a post failed!",
      });
    });
};

exports.updatePostById = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId,
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.matchedCount === 1) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized to Update!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't update post!",
      });
    });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching post failed!",
      });
    });
};

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      return post
        ? res.status(200).json(post)
        : res.status(404).json({ message: "Post not found!" });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching post failed!",
      });
    });
};

exports.deletePostById = (req, res, next) => {
  const { id } = req.params;
  Post.deleteOne({ _id: id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized to Delete!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching post failed!",
      });
    });
};
