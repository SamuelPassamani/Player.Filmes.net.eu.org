const chromium = require("chrome-aws-lambda"); // Adicionando chrome-aws-lambda
const fetch = require("node-fetch");

exports.handler = async function (event) {
  const imdb = event.queryStringParameters.imdb;

  if (!imdb) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "IMDB ID is required" }),
    };
  }

  // Busca o hash do torrent usando a API YTS
  async function fetchTorrentHash(imdbId) {
    const apiUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.status === "ok" && data.data.movie.torrents.length > 0) {
        return data.data.movie.torrents[0].hash;
      } else {
        throw new Error("Torrent hash not found.");
      }
    } catch (error) {
      console.error("Failed to fetch torrent hash:", error);
      throw error;
    }
  }

  let browser;
  try {
    // Obter o hash do torrent
    const torrentHash = await fetchTorrentHash(imdb);

    // Lançar o Puppeteer em ambiente serverless
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Navegar para o site WebTor com o hash do torrent
    const url = `https://webtor.io/${torrentHash}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extrair o link de download do torrent
    const downloadLink = await page.$eval(
      'a[data-download="true"]', // Seletor atualizado
      (link) => link.getAttribute("href")
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadLink }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch the download link." }),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
