require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form submissions

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String
});

const Url = mongoose.model('Url', urlSchema);

// Serve static HTML file
app.use(express.static(path.join(__dirname, 'views')));

app.post('/api/shorturl', async (req, res) => {
    const { url: originalUrl } = req.body;

    // Validate URL
    if (!validUrl.isWebUri(originalUrl)) {
        return res.json({ error: 'invalid url' });
    }

    const shortUrl = shortid.generate();

    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.json({ original_url: originalUrl, short_url: shortUrl });
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const urlEntry = await Url.findOne({ shortUrl });

    if (urlEntry) {
        res.redirect(urlEntry.originalUrl);
    } else {
        res.status(404).json({ error: 'No URL found for the given short URL' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
