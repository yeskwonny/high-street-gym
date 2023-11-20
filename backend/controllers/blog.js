const express = require("express");
const Blog = require("../models/blog.js");
const auth = require("../middleware/auth.js");
const validator = require("validator");

const blogController = express.Router();

//create blog
blogController.post("/blogs/", auth(["customer", "trainer"]), (req, res) => {
  const blog = req.body.blog;

  if (!/([^\s])/.test(blog.content)) {
    res.status(400).json({
      status: 400,
      message: "content is empty",
    });
    return;
  }

  if (!/([^\s])/.test(blog.title)) {
    res.status(400).json({
      status: 400,
      message: "title is empty",
    });
    return;
  }
  const blogs = Blog.newBlog(
    null,
    blog.date,
    blog.userId,
    validator.escape(blog.title),
    validator.escape(blog.content)
  );

  Blog.createBlog(blogs)
    .then((blog) => {
      res.status(200).json({
        status: 200,
        message: "Create new blog",
        blog: blog,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: `Failed to create new blog / ${error}`,
      });
    });
});

//TODO: Get blogs by desc order
blogController.get("/blogs", auth(["customer", "trainer"]), (req, res) => {
  Blog.getBlogsbylatest()
    .then((blogs) => {
      res.status(200).json({
        status: 200,
        message: "Get blogs by latest date",
        blogs: blogs,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: `Failed to get blogs /${error}`,
      });
    });
});

module.exports = blogController;
