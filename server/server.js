require('dotenv').config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { readdirSync } from 'fs';
const morgan = require('morgan');

const app = express();

// DB CONNECTION
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('DB CONNECTED!'))
  .catch((err) => console.log('DB CANNOT CONNECT BECAUSE::', err));

// middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`App is listening to port: ${port}`));
