const express    = require('express')
const bodyParser = require('body-parser')
const cors       = require('cors')
const morgan     = require('morgan')
const mongoose   = require('mongoose')
const config     = require('./config/config')
mongoose.Promise = global.Promise


const app = express()

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data })
});


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
      return res.sendStatus(200);
    }
    next();
});

app.use(require('./routes/cards'))
app.use(require('./routes/users'))

mongoose.set('useCreateIndex', true)
mongoose.connect(config.dbURL, config.dbOptions)
mongoose.connection
  .once('open', () => {
    console.log(`Mongoose - successful connection ...`)
    app.listen(process.env.PORT || config.port,
      () => console.log(`Server start on port ${config.port} ...`))
  })
  .on('error', error => console.warn(error))