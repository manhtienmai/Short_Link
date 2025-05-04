
import express from "express";
import * as lib from "./utils.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from "cors";
import middleware from "./middleware.js";
import { callWithRetry } from "./optimizer/retryHelper.js";
import * as path from "node:path";

const app = express()
const port = 3001;
app.use(express.json());
app.use(cors());
// app.use(middleware.logger); // ghi log moi request
app.use(middleware.validateUrl);
app.use(middleware.rateLimit);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'public')));

app.get('/short/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const url = await callWithRetry(() => lib.findOrigin(id));
        if (url == null) {
            res.status(404).send("<h1>404 Not Found</h1>");
          } else {
            res.status(200).send(url);
          }
    } catch (err) {
        next(err); // chuyen loi cho error handler
    }
})

app.post('/create', async (req, res, next) => {
    try {
        const url = req.query.url;
        const newID = await callWithRetry(() => lib.shortUrl(url));
        res.status(201).send(newID);
    } catch (err) {
        next(err);
    }
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.use(middleware.notFound);
app.use(middleware.errorHandler);

app.listen(port, () => {
    console.log(`CS1 app listening on port ${port}`);
})
