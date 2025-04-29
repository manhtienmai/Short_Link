import express from "express";
import * as lib from "./utils.js";
import cors from "cors";

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

app.get("/short/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const url = await lib.findOrigin(id);
    if (url == null) {
      res.send("<h1>404</h1>");
    } else {
      res.send(url);
    }
  } catch (err) {
    res.send(err);
  }
});

app.post("/create", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    const newID = await lib.shortUrl(url);
    res.send(newID);
  } catch (err) {
    res.send(err);
  }
});

app.listen(port, () => {
  console.log(`CS1 app listening on port ${port}`);
});
