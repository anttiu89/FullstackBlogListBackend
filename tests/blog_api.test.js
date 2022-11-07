const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
const helper = require("./test_helper")
const Blog = require("../models/blog")
const bcrypt = require("bcrypt")
const User = require("../models/user")

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash("salainen", 10)
  const user = new User({ username: "testi", passwordHash })
  const savedUser = await user.save()
  //console.log(savedUser)
  const userId = savedUser._id
  //console.log(userId)

  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    blogObject.user = userId
    await blogObject.save()
    //console.log(blogObject)
  }
})

//npm test -- tests/blog_api.test.js
describe("GET all blogs test group", () => {
  test("get all blogs returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("get all blogs", async () => {
    const response = await api.get("/api/blogs")

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test("get all blogs and check if specific title is in the list", async () => {
    const response = await api.get("/api/blogs")

    const titles = response.body.map(r => r.title)
    expect(titles).toContain("React patterns")
  })

  test("get all blogs and check if property id exists", async () => {
    const response = await api.get("/api/blogs")
  
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })

  test("get all blogs and check if property user exists", async () => {
    const userResponse = await api.get("/api/users")
    const users = userResponse.body
    const userId = users[0].id

    const blogResponse = await api.get("/api/blogs")
    blogResponse.body.forEach(blog => {
      console.log(blog)
      console.log(userId)
      expect(blog.user).toBeDefined()
      expect(blog.user.id).toEqual(userId)
    })
  })
})

describe("POST new blog test group", () => {
  test("post blog and valid blog can be added", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  
    const login = response.body

    const newBlog = {
      title: "Test blog",
      author: "Testaaja",
      url: "http://blog.test.com",
      likes: 1
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
    const blogs = blogsAtEnd.map(b => { 
      const blog = {
        title: b.title,
        author: b.author,
        url: b.url,
        likes: b.likes
      }
      return blog
    })
    expect(blogs).toContainEqual(newBlog)
  })
  
  test("post blog and valid blog can be added without likes", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const newBlog = {
      title: "Test blog",
      author: "Testaaja",
      url: "http://blog.test.com"
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
    const blogs = blogsAtEnd.map(b => { 
      const blog = {
        title: b.title,
        author: b.author,
        url: b.url,
        likes: b.likes
      }
      return blog
    })
  
    const newBlogWithLikes = {
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: 0
    }
  
    expect(blogs).toContainEqual(newBlogWithLikes)
  })
  
  test("post blog and invalid blog is not added", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const newBlog = {
      title: "",
      author: "",
      url: "",
      likes: -1
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test("post blog and invalid title missing is not added", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const newBlog = {
      author: "Testaaja",
      url: "http://blog.test.com"
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test("post blog and invalid author missing is not added", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const newBlog = {
      title: "Test blog",
      url: "http://blog.test.com"
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test("post blog and invalid url missing is not added", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const newBlog = {
      title: "Test blog",
      author: "Testaaja"
    }
  
    await api
      .post("/api/blogs")
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test("post blog and unauthorized", async () => {
    const newBlog = {
      title: "Test blog",
      author: "Testaaja",
      url: "http://blog.test.com",
      likes: 1
    }
  
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })  
})

describe("GET specific blog test group", () => {
  test("get specific blog by id", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
  
    expect(resultBlog.body).toEqual(processedBlogToView)
  })
})

describe("DELETE blog test group", () => {
  test("delete blog by id", async () => {
    const newlogin = {
      username: "testi",
      password: "salainen"
    }
    const response = await api
      .post("/api/login")
      .send(newlogin)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const login = response.body

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    
    await api
      .delete(`/api/blogs/${blogToDelete.id.toString()}`)
      .set({
        "Authorization": "bearer " + login.token.toString(), 
        "Accept": "application/json"
      })
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  
    const blogs = blogsAtEnd.map(b => { 
      const blog = {
        title: b.title,
        author: b.author,
        url: b.url,
        likes: b.likes,
        user: b.user,
        id: b.id
      }
      //console.log(blog)
      return blog
    })
    //console.log(blogToDelete)
    expect(blogs).not.toContainEqual(blogToDelete)
  })

  test("delete blog by id and unauthorized", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    
    await api
      .delete(`/api/blogs/${blogToDelete.id.toString()}`)
      .expect(401)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe("PUT updated blog test group", () => {
  test("put blog and valid blog can be updated", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes = 0
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    
    const blogs = blogsAtEnd.map(b => { 
      const blog = {
        title: b.title,
        author: b.author,
        url: b.url,
        likes: b.likes,
        user: b.user,
        id: b.id
      }
      return blog
    })
    expect(blogs).toContainEqual(blogToUpdate)
  })
})

afterAll(() => {
  mongoose.connection.close()
})