const express = require('express')
const lib = require('./utils')
const {initDb} = require("./index");
const app = express()
const port = 3001;
const middleware = require('./middleware');
(async () => {
    await initDb();
})();

app.use(express.json()); // xu li json body
app.use(middleware.logger); // ghi log moi request
app.use(middleware.validateUrl);

app.get('/short/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const url = await lib.findOrigin(id);
        if (url == null) {
            res.send("<h1>404</h1>");
        }
        else {
            res.send(url);
        }
    } catch (err) {
        next(err); // chuyen loi cho error handler
    }
})

app.post('/create', async (req, res, next) => {
    try {
        const url = req.query.url;
        const newID = await lib.shortUrl(url);
        res.send(newID);

    } catch (err) {
        next(err);
    }
});

app.use(middleware.notFound);
app.use(middleware.errorHandler);

app.listen(port, () => {
    console.log(`CS1 app listening on port ${port}`);
})
