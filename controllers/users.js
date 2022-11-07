const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/user")

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({}).populate("blogs", { title: 1, author: 1, url: 1, likes: 1 })
    response.json(users)
  } catch (exception) {
    next(exception)
  }
})

usersRouter.post("/", async (request, response, next) => {
  try {
    const { username, name, password } = request.body

    if (username === undefined) {
      return response.status(400).json({
        error: "username is required"
      })
    }
    if (username.length < 3) {
      return response.status(400).json({
        error: "username is shorter than the minimum allowed length"
      })
    }

    if (password === undefined) {
      return response.status(400).json({
        error: "password is required"
      })
    }
    if (password.length < 3) {
      return response.status(400).json({
        error: "password is shorter than the minimum allowed length"
      })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return response.status(400).json({
        error: "username must be unique"
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter