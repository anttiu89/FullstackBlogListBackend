const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const middleware = require("../utils/middleware")

blogsRouter.get("/", async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.get("/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.post("/", middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  try {
    const body = request.body
    const user = request.user
    //console.log(user)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    })
    const savedBlog = await blog.save()

    if (user) {
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
    }
    
    response.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete("/:id", middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    //console.log(user)

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).end()
    } 

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      return response.status(204).end()
    } else {
      return response.status(401).end()
    }
    
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog)
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter