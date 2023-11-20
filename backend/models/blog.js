const { db } = require("../database/mysql.js");

function newBlog(id, datetime, user_id, title, content, fname, lname) {
  return {
    id,
    datetime,
    user_id,
    title,
    content,
    fname,
    lname,
  };
}

async function getBlogsbylatest() {
  const [allBlogResults] = await db.query(
    `SELECT blogs.blog_id, blogs.blog_datetime, blogs.blog_user_id, blogs.blog_title, blogs.blog_content, users.user_firstname, users.user_lastname
    FROM blogs
    LEFT JOIN users ON blogs.blog_user_id = users.user_id
    ORDER BY blogs.blog_datetime DESC`
  );

  return await allBlogResults.map((blogResult) =>
    newBlog(
      blogResult.blog_id,
      blogResult.blog_datetime,
      blogResult.blog_user_id,
      blogResult.blog_title,
      blogResult.blog_content,
      blogResult.user_firstname,
      blogResult.user_lastname
    )
  );
}

// create blogs
async function createBlog(blog) {
  delete blog.id;

  return db
    .query(
      "INSERT INTO blogs (blog_datetime, blog_user_id, blog_title, blog_content)" +
        "VALUE (?,?,?,?)",
      [blog.datetime, blog.user_id, blog.title, blog.content]
    )
    .then(([result]) => {
      return { ...blog, id: result.insertId };
    });
}

module.exports = {
  newBlog,
  getBlogsbylatest,
  createBlog,
};
