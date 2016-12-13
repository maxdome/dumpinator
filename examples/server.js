'use strict';

const path = require('path');
const express = require('express'); // eslint-disable-line

const app = express();
app.use(express.static(path.join(__dirname, '../test/fixtures/')));
app.listen(3333, '127.0.0.1');

console.log('Server listen at port 3333');
