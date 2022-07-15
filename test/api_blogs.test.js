const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const api = supertest(app);

const initialBlogs = [
  {
    title: "Learning full stack",
    author: "Dinesh Khanal",
    url: "http://dineshkhanal.blogspot.com",
    likes: 5,
  },
  {
    title: "Learning javaScript is tricky",
    author: "Umesh Devkota",
    url: "http://umeshdev.blogspot.com",
    likes: 3,
  },
];
let auth = {};
beforeEach(async () => {
  const passwordHash = await bcrypt.hash("secret", 1);
  const testUser = {
    username: "test",
    name: "test user",
    passwordHash,
  };
  await Blog.deleteMany({});
  await User.deleteMany({});
  let user = new User(testUser);
  const savedUser = await user.save();
  auth.user_id = savedUser.id;
  auth.token = jwt.sign(
    { username: "test", id: auth.user_id },
    process.env.SECRET,
    {
      expiresIn: 60 * 60,
    }
  );

  const blog = new Blog(initialBlogs[0]);
  blog.user = auth.user_id;
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  const blog1 = new Blog(initialBlogs[1]);
  blog1.user = auth.user_id;
  const savedBlog1 = await blog1.save();
  user.blogs = user.blogs.concat(savedBlog1._id);
});
test("blogs return in correct number in json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
}, 100000);
test("There are two blogs", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(2);
});
test("Unique identifier property is defined as id", async () => {
  const response = await api.get("/api/blogs");
  const blog = await response.body[0];
  expect(blog.id).toBeDefined();
});
test("A valid blog can be added", async () => {
  const newBlog = {
    title: "Jest testing learning is fun",
    author: "Ramesh Mainali",
    url: "http://ramesh.blogspot.com",
    likes: 2,
  };
  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `bearer ${auth.token}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const titles = response.body.map((r) => r.title);
  expect(titles).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain("Jest testing learning is fun");
});
test("like property is not missing", async () => {
  const newBlog = {
    title: "Jest testing learning is fun",
    author: "Ramesh Mainali",
    url: "http://ramesh.blogspot.com",
    likes: 0,
  };
  const request = await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `bearer ${auth.token}`);
  expect(request.body.likes).toBeDefined();
});
describe("title and url are not missing", () => {
  test("title missing", async () => {
    const newBlog = {
      author: "Ramesh Mainali",
      url: "http://ramesh.blogspot.com",
      likes: 0,
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `bearer ${auth.token}`)
      .expect(400);
  }, 100000);
  test("url missing", async () => {
    const newBlog = {
      title: "Jest testing learning is fun",
      author: "Ramesh Mainali",
      likes: 0,
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(400)
      .set("Authorization", `bearer ${auth.token}`);
  }, 100000);
  test("title and url are not missing", async () => {
    const newBlog = {
      title: "Jest testing learning is fun",
      author: "Ramesh Mainali",
      url: "http://ramesh.blogspot.com",
      likes: 0,
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `bearer ${auth.token}`)
      .expect(201);
  }, 100000);
});

describe("Deleting and updating blog post", () => {
  test("Deleting single blog post", async () => {
    const blogsAtStart = await Blog.find();
    const blogToDelete = blogsAtStart[0];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `bearer ${auth.token}`);
    expect(204);
    const blogsAtEnd = await Blog.find();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);
    const titles = blogsAtEnd.map((b) => b.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
  test("Updating single blog post", async () => {
    const blogsAtStart = await Blog.find();
    const blogToUpdate = blogsAtStart[0];
    const updateTo = {
      title: "Jest testing learning is fun",
      author: "Ramesh Mainali",
      url: "http://ramesh.blogspot.com",
      likes: 4,
    };
    await api.put(`/api/blogs/${blogToUpdate.id}`).send(updateTo).expect(200);
    const blogAfterUpdate = await Blog.findById({ _id: blogToUpdate.id });
    expect(blogAfterUpdate.likes).toBe(4);
  });
});
afterAll(() => {
  mongoose.connection.close();
});
