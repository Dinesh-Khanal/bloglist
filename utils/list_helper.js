const dummy = (blogs) => {
  return 1;
};

const total_like = (blogs) => {
  return blogs.reduce((pValue, item) => item.likes + pValue, 0);
};
const favoriteBlog = (blogs) => {
  let fBlog = blogs[0];
  blogs.forEach((b) => {
    if (b.likes > fBlog.likes) {
      fBlog = b;
    }
  });
  return {
    title: fBlog.title,
    author: fBlog.author,
    likes: fBlog.likes,
  };
};
const mostBlogs = (blogs) => {
  const authorBlogs = blogs.reduce(
    (accumulator, blog) => ({
      ...accumulator,
      [blog.author]: ++accumulator[blog.author] || 1,
    }),
    {}
  );
  mostB = 0;
  mostA = "";
  for (const key in authorBlogs) {
    if (authorBlogs[key] > mostB) {
      mostB = authorBlogs[key];
      mostA = key;
    }
  }
  return { author: mostA, blogs: mostB };
};
const mostLikes = (blogs) => {
  const authorLikes = blogs.reduce(
    (p, v) => ({
      ...p,
      [v.author]: p[v.author] + v.likes || v.likes,
    }),
    {}
  );
  mostL = 0;
  mostA = "";
  for (const key in authorLikes) {
    if (authorLikes[key] > mostL) {
      mostL = authorLikes[key];
      mostA = key;
    }
  }
  return {
    author: mostA,
    likes: mostL,
  };
};
module.exports = {
  dummy,
  total_like,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
