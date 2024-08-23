import puppeteer from 'puppeteer';
import express from 'express';

const server = async () => {
  const app = express();
  app.get('/', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
      'https://static.mobility-operation-info.emetro-app.osakametro.co.jp/emetro/cache/common/app/operation?TRANSITION_SOURCE_KBN=2&TRANSITION_SOURCE_ID=BROWSER_SUBWAY_TOP&TRANSITION_SOURCE_URL=https://subway.osakametro.co.jp/guide/subway_information.php',
      { waitUntil: 'load' }
    );
    await page.waitForFunction(
      () => document.querySelector('#operation')?.innerHTML.trim() !== '',
      { timeout: 5000 }
    );
    const lines = [
      '御堂筋線',
      '谷町線',
      '四つ橋線',
      '中央線',
      '千日前線',
      '堺筋線',
      '長堀鶴見緑地線',
      '今里筋線',
      '南港ポートタウン線',
    ];
    const status = await page.evaluate((lines) => {
      return [
        ...document.querySelectorAll(
          '#operation > div > div > div.operation_information_PC.operation_absolute > div>div>div>div>img'
        ),
      ].map((img, i) => {
        return img.src.split('/').at(-1).includes('clear')
          ? { [lines[i]]: 'normal' }
          : { [lines[i]]: 'stop' };
      });
    }, lines);
    res.json(status);
  });
  app.listen();
};
await server();
