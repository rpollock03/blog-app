var express = require("express"),
  app = express(),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose");

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/blog_app", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //means we don't need to write "index.html" etc
app.use(express.static("public"));
app.use(methodOverride("_method")) //changes HTML POST requests to PUT and Delete requests. 
app.use(expressSanitizer()); //needs to be after bodyParser. Stops user entering JS into html parts

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now } //can do this for any of the properties
});

var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
  title: "Test Blog",
  image: "https://unsplash.com/photos/EPy0gBJzzZU",
  body: "HELLO THIS IS A BLOG POST"
});
*/

// RESTFUL ROUTES

app.get("/", function (req, res) {
  res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function (req, res) {
  Blog.find({}, function (err, blogs) {
    if (err) {
      console.log("ERROR!");
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

//NEW ROUTE
app.get("/blogs/new", function (req, res) {
  res.render("new");
})

//CREATE ROUTE
app.post("/blogs", function (req, res) {
  //sanitize the text area, so we can enter html without risk. 
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    }
    else {
      res.redirect("/blogs");
    }
  })
})

// SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
  // testing res.send("SHOW PAGE");
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.render("show", { blog: foundBlog });
    }
  })
})

// EDIT ROUTE

app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.render("edit", { blog: foundBlog });
    }
  })
})

// UPDATE ROUTE
app.put("/blogs/:id", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs/" + req.params.id)
    }
  })
})

// DELETE ROUTE
app.delete("/blogs/:id", function (req, res) {
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs");
    }
  })
})

// use port 3000 unless there exists a preconfigured port
var port = process.env.port || 5000;

app.listen(port, function () {
  console.log("app is listening on port:" + port);
});
