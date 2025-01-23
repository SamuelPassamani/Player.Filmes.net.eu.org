const puppeteer = require('puppeteer');

exports.handler = async function(event, context) {
  const imdb = event.queryStringParameters.imdb;

  if (!imdb) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "IMDB ID is required" }),
    };
  }

  let browser;
  try {
    // Lançar o Puppeteer em ambiente headless
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navegar para o site com o hash do torrent
    const url = `https://webtor.io/${imdb}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Pegar o link de download do torrent
    const downloadLink = await page.$eval(
      "a.btn.btn-sm.btn-accent.m-2.closeable-close",
      (link) => link.getAttribute("href")
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadLink }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch the download link" }),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
