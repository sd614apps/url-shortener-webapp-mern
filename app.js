const express = require('express');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const ShortUrl = require('./models/shortUrl'); // We will create this later

const app = express();
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/urlShortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find();
    const baseUrl = req.protocol + '://' + req.get('host') + '/';
    res.render('index', { shortUrls: shortUrls, baseUrl: baseUrl });
}); 

// Shorten URL route
app.post('/shorten', async (req, res) => {
    const originalUrl = req.body.fullUrl;

    // Validate URL
    if (!validUrl.isUri(originalUrl)) {
        return res.status(401).send('Invalid URL');
    }

    // Check if URL is already in DB, else create new
    let shortUrl = await ShortUrl.findOne({ full: originalUrl });
    if (!shortUrl) {
        shortUrl = new ShortUrl({ full: originalUrl });
        await shortUrl.save();
    }

    res.redirect('/');
});

// Redirect to full URL
app.get('/:shortId', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortId });
    if (shortUrl) {
        shortUrl.clicks++;
        shortUrl.save();
        return res.redirect(shortUrl.full);
    }

    res.status(404).send('Not found');
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});

app.set('view engine', 'ejs');
