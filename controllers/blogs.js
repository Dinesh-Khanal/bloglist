const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");
blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.post("/", async (request, response, next) => {
  const { title, author, url, likes } = request.body;
  if (!request.token) {
    return response.status(401).json({ error: "token missing" });
  }
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "invalid token" });
    }
    if (!title || !url) {
      response.status(400).json({ error: "title and url is required" });
    } else {
      const user = await User.findById(decodedToken.id);
      const blog = new Blog({
        title,
        author,
        url,
        likes,
        user: user._id,
      });
      const savedBlog = await blog.save();
      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
      response.status(201).json(savedBlog);
    }
  } catch (error) {
    next(error.message);
  }
});
blogRouter.delete("/:id", async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({ error: "token missing" });
  }
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "invalid token" });
    }
    const blog = await Blog.findById(request.params.id);
    if (decodedToken.id === blog.user.toString()) {
      const user = await User.findById(decodedToken.id);
      await Blog.findByIdAndRemove(request.params.id);
      user.blogs = user.blogs.filter((b) => b !== blog._id.toString());
      await user.save();
      response.status(204).end();
    } else {
      response
        .status(401)
        .json({ error: "Only creater can delete the blog post" });
    }
  } catch (error) {
    next(error);
  }
});
blogRouter.put("/:id", async (request, response, next) => {
  try {
    const blog = request.body;
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    response.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});
module.exports = blogRouter;
