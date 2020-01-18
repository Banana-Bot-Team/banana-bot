const puppeteer = require('puppeteer');
const path = require('path');


const URL = "http://game-i.daa.jp/?%E3%82%A2%E3%83%97%E3%83%AA%2F%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%83%95%E3%83%AA%E3%83%83%E3%83%91%E3%83%BC%28WORLD%20FLIPPER%29";

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--single-process'] });
  const page = await browser.newPage();

  try {
    await page.goto(URL);

    const svg = await page.$('svg');

    !!svg && await svg.screenshot({ path: path.join(__dirname, 'revenue.png') });

    const table = await page.$$('.style_table');
    const rank = await table[1].$('tbody');

    !!rank && await rank.screenshot({ path: path.join(__dirname, 'revenue_rank.png') });

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();