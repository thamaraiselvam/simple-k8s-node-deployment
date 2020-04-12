const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const promMid = require('express-prometheus-middleware');

app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let namesModel
app.use(async (req, res, next) => {
    db = await mongoose.connect(`mongodb://${process.env.DBHOST}:${process.env.DBPORT}/contacts`, {
        "user": process.env.DBUSERNAME,
        "pass": process.env.DBPASSWORD,
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    nameSchema = new mongoose.Schema({ name: 'string' });
    if (namesModel == undefined) {
        namesModel = await mongoose.model('names', nameSchema);
    }

    next()
})


app.post("/", (req, res) => {
    let name = req.body.name
    namesModel.create({ name: name }, function (err, small) {
        collectMetrics();
        if (err) {
            throw new Error(err)
        }
        collectMetrics();
        res.send(`${name} added`)
    });
})


app.get("/", async (req, res) => {
    let result = await namesModel.find({}).select({ "_id": false, "__v": false })
    res.json(result)
})

app.listen(process.env.PORT, () => {
    console.log("app listen on", process.env.PORT)
})
