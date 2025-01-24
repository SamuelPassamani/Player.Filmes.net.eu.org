const puppeteer = require("puppeteer");
const fetch = require("node-fetch"); // Adicione esta linha se estiver usando Node.js < 18

exports.handler = async (event) => {
  try {
    const { imdb } = event.queryStringParameters;

    if (!imdb) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "O parâmetro 'imdb' é obrigatório." }),
      };
    }

    const ytsApiUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb}&with_images=true&with_cast=true`;

    const response = await fetch(ytsApiUrl);
    if (!response.ok) {
      throw new Error(`Erro ao acessar a API YTS: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || data.status !== "ok" || !data.data.movie) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Não foi possível encontrar detalhes do filme para o IMDb fornecido.",
        }),
      };
    }

    const movie = data.data.movie;
    const hash = movie.torrents[0]?.hash;

    if (!hash) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Nenhum hash de torrent foi encontrado para o filme.",
        }),
      };
    }

    const downloadLink = await fetchDownloadLinkFromWebtor(hash);
    if (!downloadLink) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Falha ao obter o link de download." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadLink }),
    };
  } catch (error) {
    console.error("Erro no processo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação." }),
    };
  }
};

async function fetchDownloadLinkFromWebtor(hash) {
  const url = `https://webtor.io/${hash}`;
  let downloadLink = "";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Aguardar e clicar no botão de download
    await page.waitForSelector('button[data-umami-event="download"]', {
      timeout: 15000,
    });
    await page.click('button[data-umami-event="download"]');

    // Aguardar o link de download aparecer
    await page.waitForSelector("a.btn.btn-sm.btn-accent.m-2.closeable-close", {
      timeout: 15000,
    });
    downloadLink = await page.$eval(
      "a.btn.btn-sm.btn-accent.m-2.closeable-close",
      (link) => link.getAttribute("href")
    );
  } catch (error) {
    console.error("Erro ao buscar o link de download no Webtor:", error);
  } finally {
    await browser.close();
  }

  return downloadLink;
}
