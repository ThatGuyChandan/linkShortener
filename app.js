const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ShortUrl = require("./Database/shortUrl.js");
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
mongoose.connect("mongodb://localhost/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", async (req, res) => {
  const ShortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: ShortUrls });
});

app.post("/short-url", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  try {
    shortUrl.clicks++;
    await shortUrl.save();
  } catch (error) {
    console.error("Error updating click count:", error);
    return res.sendStatus(500); // Internal Server Error
  }

  res.redirect(shortUrl.full);
});

app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await ShortUrl.findByIdAndDelete(id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting short URL:", error);
    res.sendStatus(500); // Internal Server Error
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
