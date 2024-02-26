const express = require('express');// ****
const session = require('express-session');
// const sequelize = require('./config/config');
const sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const exphbs = require('express-handlebars'); //*** */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const moment = require('moment');
const { db } = require('./models');

// Initialize Sequelize and session store
const sequelizeInstance = new sequelize("database", "username", "password", {
  dialect: "sqlite",
  storage: "./session.sqlite",
});
const sessionStore = new SequelizeStore({ db: sequelizeInstance });

const app = express();//** */

// Session middleware setup with Sequelize Store
app.use(
  session({
    secret: 'your-session-secret', // replace with your own session secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
  })
);


// Load environment variables
dotenv.config();


const PORT = process.env.PORT || 3000;

// Setup security headers with Helmet
app.use(helmet());

// Rate limiter configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

// Setup Handlebars with custom helpers // ********** Troubleshooting handlebars
const hbs = exphbs.create({
  helpers: {
    formatDate: function (date, format) {
      return moment(date).format(format);
    },
    formatDateTime: (date) => date.toISOString().slice(0, 16),
    ifEquals: (arg1, arg2, options) =>
      arg1 == arg2 ? options.fn(this) : options.inverse(this),
  },
});
const path = require('path');

// ******************* Troubleshooting handlebars

// app.engine('handlebars', hbs.engine);
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
// app.use(express.static(path.join(__dirname, 'public'))); //****** */
// app.use(require('./routes/index'));// ********** Troubleshooting handlebars

// Override method for supporting PUT and DELETE in forms
app.use(methodOverride('_method'));

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware setup with Sequelize Store
// const sessionStore = new SequelizeStore({ db: sequelize });
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
//   })
// );

app.use(flash()); // Use connect-flash middleware

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Sync the session store
sessionStore.sync();

// Static folder setup
app.use(express.static('public'));

// Routes setup
require('./routes/index')(app); //********* */`

// add login route here
// app.get('/views/layouts/login', function(_req, res){      // added login route ********
//   res.render('login');
// });
// app.get('/register', function(req, res) { // added register route`
//   res.render('register');
// });
// app.get('/dashboard', function(req, res) { // added dashboard route
//   res.render('dashboard');
// });
// app.get('/logout', function(req, res) { // added logout route
//   res.render('logout');
// });
// 404 Not Found Middleware
app.use((req, res, next) => res.status(404).send('404 Not Found'));


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Server started on: http://localhost:' + PORT));
