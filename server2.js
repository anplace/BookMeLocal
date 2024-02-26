// load dependencies
const express = require("express");
const Sequelize = require("sequelize");
const exphbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");

// initalize sequelize with session store
var SequelizeStore = require("connect-session-sequelize")(session.Store);

// create database, ensure 'sqlite3' in your package.json
var sequelize = new Sequelize("database", "username", "password", {
  dialect: "sqlite",
  storage: "./session.sqlite",
});

// configure express
const app = express();

const PORT = process.env.PORT || 3000;

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/", (_req, res) => {
  res.render("home");
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.use(
  session({
    secret: "keyboard cat",
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    proxy: true, // if you do SSL outside of node.
  })
);