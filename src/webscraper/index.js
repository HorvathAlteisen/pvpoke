const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.pokewiki.de/Pok%C3%A9mon-Liste';

async function scrapeData() {
    console.info('Scraping website...');

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const scrapedData = [];

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

        const result = JSON.stringify(scrapedData);

        fs.writeFile('localization.json', result, (err) => {
            err ? console.log(err) : console.info('Data written to file successfully')
        });

        console.info('Scraping finished');
        return scrapedData;

    } catch (error) {
        console.error('Failed to scrape the website');
        console.error(error);
    }
}

scrapeData();