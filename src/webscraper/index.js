const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
const zlib = require('zlib');

const app = express();

const url = 'https://www.pokewiki.de/Pok%C3%A9mon-Liste';

app.get('/', async (req, res) => {
    console.info('Scraping website...');
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const scrapedData = [];
        let result;

        $('table.pwtable1 tbody').each((i, elem) => {
            elem.children
            .filter((_, i) => i !== 0)
            .filter((child) => $(child).text().trim() !== '')
            .forEach((child) => {
                const filtered = $(child).text().split('\n').filter(
                    (_, i) => (i !== 0 && i !== 2 && i !== 9)
                );

                scrapedData.push({
                    de: filtered[1],
                    en: filtered[2],
                    fr: filtered[3],
                    jp: filtered[4],
                    kr: filtered[5],
                    zh: filtered[6]
                });
            });
        });

        result = JSON.stringify(scrapedData);

        fs.writeFile('data.json', zlib.gzipSync(result).toString('base64'), (err) => {
            if (err) {
                console.log(err);
            }
        });

        res.json(scrapedData);

    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape the website' });
    }
    console.info('Scraping finished');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});