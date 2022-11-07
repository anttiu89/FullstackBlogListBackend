const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0
  blogs.forEach(blog => {
    sum += blog.likes
  })
  return sum
}

const favoriteBlog = (blogs) => {
  if (blogs === undefined || blogs.length === 0) {
    return null
  }

  let favoriteIndex = -1
  let maxLikeCount = 0
  for (let i = 0; i < blogs.length; ++i) {
    if (blogs[i].likes > maxLikeCount || favoriteIndex < 0) {
      maxLikeCount = blogs[i].likes
      favoriteIndex = i
    }
  }
  
  return blogs[favoriteIndex]
}

const mostBlogs = (blogs) => {
  if (blogs === undefined || blogs.length === 0) {
    return null
  }

  var bloggerList = []
  blogs.forEach(blog => {
    let index = bloggerList.findIndex(blogger => {
      return blog.author === blogger.author
    })
    if (index < 0) {
      console.log(`Add blog ${blog.author}`)
      let blogger = {
        author: blog.author,
        blogs: 1
      }
      bloggerList.push(blogger)
    }
    else {
      console.log(`Add blog count ${blog.author}`)
      ++bloggerList[index].blogs
    }
  })

  console.log(`bloggerList count ${bloggerList.length}`)
  let mostBlogsIndex = -1
  let maxBlogCount = 0
  for (let i = 0; i < bloggerList.length; ++i) {
    console.log(`bloggerList blogs ${bloggerList[i].author} ${bloggerList[i].blogs}`)
    if (bloggerList[i].blogs > maxBlogCount || mostBlogsIndex < 0) {
      maxBlogCount = bloggerList[i].blogs
      mostBlogsIndex = i
    }
  }
  console.log("Return ", bloggerList[mostBlogsIndex])
  return bloggerList[mostBlogsIndex]
}

const mostLikes = (blogs) => {
  if (blogs === undefined || blogs.length === 0) {
    return null
  }

  var bloggerList = []
  blogs.forEach(blog => {
    let index = bloggerList.findIndex(blogger => {
      return blog.author === blogger.author
    })
    if (index < 0) {
      console.log(`Add blog ${blog.author}`)
      let blogger = {
        author: blog.author,
        likes: blog.likes
      }
      bloggerList.push(blogger)
    }
    else {
      console.log(`Add blog count ${blog.author}`)
      bloggerList[index].likes += blog.likes
    }
  })

  console.log(`bloggerList count ${bloggerList.length}`)
  let mostLikesIndex = -1
  let maxLikeCount = 0
  for (let i = 0; i < bloggerList.length; ++i) {
    console.log(`bloggerList likes ${bloggerList[i].author} ${bloggerList[i].likes}`)
    if (bloggerList[i].likes > maxLikeCount || mostLikesIndex < 0) {
      maxLikeCount = bloggerList[i].likes
      mostLikesIndex = i
    }
  }
  console.log("Return ", bloggerList[mostLikesIndex])
  return bloggerList[mostLikesIndex]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}