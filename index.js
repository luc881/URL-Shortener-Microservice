require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

const dns = require('dns');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

// URL Shortener Microservice
let urls = []
let count = 1;

const verifyURL = (url, callback) =>{
    try {
        // Parse the URL
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        // Perform DNS lookup
        dns.lookup(hostname, (err, address, family) => {
            if (err) {
                // Handle DNS lookup error
                callback(err);
            } else {
                // DNS lookup successful
                callback(null, address);
            }
        });
    } catch (error) {
        // Handle URL parsing error
        callback(error);
    }
}
app.post('/api/shorturl', (req, res) => {
    const body = req.body;
    const originalUrl = req.body.url;
    const shortUrl = count;
    count++;

    verifyURL(originalUrl, (err, ipAddress) => {
        if (err) {
            res.json({ error: 'invalid url' });
        } else {
            urls.push(
                {
                    originalUrl: originalUrl,
                    shortUrl: shortUrl
                }
            )
            res.json({ originalUrl: originalUrl, shortUrl: shortUrl });

        }
    });


})

// Short url redirect

app.get('/api/shorturl/:shortUrl', (req, res) => {
    const url = req.params.shortUrl;

    urls.forEach((item) => {
        if (item.shortUrl == url) {
            res.redirect(item.originalUrl);
        } else {
            res.json({ error: 'url not found' });
        }
    } )

} )


app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
