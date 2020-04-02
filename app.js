require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/error");
const User = require("./models/user");
const mongoose = require("mongoose");
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const mailServer = require("./services/mail");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const store = new mongoDBstore({
  uri: process.env.DATABASE_URL,
  collection: "sessions"
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "mysecretAtsessionExpress",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLogged; //data for GET requests
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500"
  });
});
mongoose
  .connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    mailServer.initMailServer();
    app.listen(3000, () => {
      console.log("server at 3000");
    });
  })
  .catch(err => {
    console.log(err);
  });
