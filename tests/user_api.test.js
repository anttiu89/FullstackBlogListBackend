const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
const helper = require("./test_helper")
const bcrypt = require("bcrypt")
const User = require("../models/user")

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash("sekret", 10)
  const user = new User({ username: "root", passwordHash })

  await user.save()
})

//npm test -- tests/user_api.test.js
describe("POST new user test group", () => {
  test("post user and valid user can be added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "testi",
      name: "Testaaja",
      password: "salainen",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test("post user and username already taken is not added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(result.body.error).toContain("username must be unique")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test("post user and invalid username missing is not added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: "Testaaja",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    console.log(result.body.error)
    expect(result.body.error).toContain("username is required")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test("post user and invalid username too short is not added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "te",
      name: "Testaaja",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    console.log(result.body.error)
    expect(result.body.error).toContain("username is shorter than the minimum allowed length")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test("post user and invalid password missing is not added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "testi",
      name: "Testaaja"
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    console.log(result.body.error)
    expect(result.body.error).toContain("password is required")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test("post user and invalid password too short is not added", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "testi",
      name: "Testaaja",
      password: "sa",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    console.log(result.body.error)
    expect(result.body.error).toContain("password is shorter than the minimum allowed length")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})