const router = require("express").Router();
const Blog = require("../models/blog");
router.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

router.post("/", async (request, response) => {
  if (!request.body.title || !request.body.url) {
    response.status(400).end();
  } else {
    const blog = new Blog(request.body);
    const result = await blog.save();
    response.status(201).json(result);
  }
});
router.delete("/:id", async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
router.put("/:id", async (request, response, next) => {
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
module.exports = router;
