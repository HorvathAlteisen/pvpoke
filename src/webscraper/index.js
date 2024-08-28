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

        $('table.pwtable1 tbody tr').each((i, elem) => {

            i !== 0 ? scrapedData.push({
                de: $(elem).find('td').eq(2).text().trim(),
                en: $(elem).find('td').eq(3).text().trim(),
                fr: $(elem).find('td').eq(4).text().trim(),
                jp: $(elem).find('td').eq(5).text().trim(),
                kr: $(elem).find('td').eq(6).text().trim(),
                zh: $(elem).find('td').eq(7).text().trim()
            }) : null
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