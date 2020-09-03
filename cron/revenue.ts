import { CronJob } from 'cron';
import * as puppeteer from 'puppeteer';
import * as path from 'path';

const WF_URL =
  'http://game-i.daa.jp/?%E3%82%A2%E3%83%97%E3%83%AA/%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%83%95%E3%83%AA%E3%83%83%E3%83%91%E3%83%BC%28WORLD+FLIPPER%29';

const GBF_URL =
  'http://game-i.daa.jp/?%E3%82%A2%E3%83%97%E3%83%AA%2F%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%96%E3%83%AB%E3%83%BC%E3%83%95%E3%82%A1%E3%83%B3%E3%82%BF%E3%82%B8%E3%83%BC';

const TOUHOULW_URL =
  'http://game-i.daa.jp/?cmd=read&page=%E3%82%A2%E3%83%97%E3%83%AA%2F%E6%9D%B1%E6%96%B9LostWord&word=%E6%9D%B1%E6%96%B9';

export async function revenueFunction() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', /*'--single-process'*/]
  });
  const page = await browser.newPage();

  async function getShot(url: string, prefix: string = '') {
    await page.goto(url, { waitUntil: ['load', 'domcontentloaded'], timeout: 0 });

    const svg = await page.$('svg');

    await svg?.screenshot({ path: path.join(__dirname, '..', 'assets', `${prefix}revenue.png`) });

    const table = await page.$$('.style_table');
    const rank = await table[1].$('tbody');

    await rank?.screenshot({ path: path.join(__dirname, '..', 'assets', `${prefix}revenue_rank.png`) });
  }

  try {
    await getShot(TOUHOULW_URL, 'touhoulw_');
    await getShot(WF_URL);
    await getShot(GBF_URL, 'gbf_');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

export const revenue = new CronJob('1 */2 * * *', revenueFunction, async function() {}, false, 'Asia/Tokyo');
