require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorten', async (req, res) => {
    const { url: originalUrl } = req.body;
    const shortUrl = shortid.generate();
    
    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.json({ shortUrl: `${req.protocol}://${req.get('host')}/api/short/${shortUrl}` });
});

app.get('/api/short/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const urlEntry = await Url.findOne({ shortUrl });

    if (urlEntry) {
        res.redirect(urlEntry.originalUrl);
    } else {
        res.status(404).json({ error: 'URL not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
