const express = require('express');
const cors = require('cors');
require('./utils/db/mongoose');
const clinicRouter = require('./controllers/routers/clinic');
const driverRouter = require('./controllers/routers/driver');
const pickUp = require('./controllers/routers/pickUp');
const userRouter = require('./controllers/routers/user');

const app = express();

app.use(cors());    // enable all CORS requests
app.use(express.json());    // accepts and convert json to object

app.use(clinicRouter);
app.use(driverRouter);
app.use(pickUp);
app.use(userRouter);

module.exports = app;