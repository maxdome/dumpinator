'use strict';

const path = require('path');
const express = require('express'); // eslint-disable-line import/no-extraneous-dependencies

const app = express();

app.use((req, res, next) => {
  res.set('x-date', (new Date()).toString());
  next();
});

app.use('/v2', (req, res, next) => {
  res.set('x-api-version', '2');
  next();
});

app.use(express.static(path.join(__dirname, '../test/fixtures/')));
const port = process.env.PORT || 3333;
app.listen(port, '127.0.0.1');

console.log(`Server listen at port ${port}`); // eslint-disable-line no-console
