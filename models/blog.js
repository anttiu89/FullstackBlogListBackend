const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    required: true
  },
  author: {
    type: String,
    minlength: 1,
    required: true
  },
  url: {
    type: String,
    minlength: 1,
    required: true
    // validate: {
    //   validator: function(v) {
    //     return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(v)
    //   },
    //   message: props => `${props.value} is not a valid phone number!`
    // },
  },
  likes: {
    type: Number,
    min: 0,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
})

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Blog", blogSchema)