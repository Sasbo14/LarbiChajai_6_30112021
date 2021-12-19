//Express app
const express = require('express');
//Import of mongoose
const mongoose = require('mongoose');
//Import of path
const path = require('path');
//import of helmet for more security
const helmet = require('helmet');

//Importing routers
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

//Implementation of environment variables
require('dotenv').config();
const mongodbUser = process.env.DB_USER;
const mongodbPass = process.env.DB_PASS;
const mongodbCluster = process.env.DB_CLUSTER;
const mongodbName = process.env.DB_NAME;

mongoose
  .connect(
    `mongodb+srv://${mongodbUser}:${mongodbPass}@${mongodbCluster}/${mongodbName}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//parse the body of the request
app.use(express.json());

//Add CORS headers to the response object to let requests pass
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

//router registration
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

app.use(helmet());
//application export
module.exports = app;
