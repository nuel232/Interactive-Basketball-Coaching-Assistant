const express = require('express')
require('dotenv').config();
const cors = require('cors')
const app = express()
const gemini = require('./routes/gemi.route')



app.use(cors({
  methods: ['GET', 'POST'],
  origin: '*',
  credentials: true,
}));

app.use(express.json())

app.use('/gemini', gemini)


app.get("/", (req, res) => {
  res.status(200).send({
      success: true,
      data: `Server Live${process.env.PORT === "production" ? "" : ` - ${process.env.PORT ||5000}`}`,
  });
});

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('app is on Port ' + port)
})


