const urlParams = new URLSearchParams(window.location.search);
const imdb = urlParams.get("imdb");

if (imdb) {
  // Função para buscar os detalhes do filme usando a API YTS
  async function fetchMovieDetails(imdb) {
    const apiUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb}&with_images=true&with_cast=true`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.status === "ok" && data.data.movie) {
        return data.data.movie;
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
    }
    return null;
  }

  // Função para buscar o link de download usando Puppeteer
  async function fetchDownloadLink(hash) {
    const url = `https://webtor.io/${hash}`;
    let downloadLink = "";

    // Launch Puppeteer (executado no servidor ou ambiente adequado)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('button[data-umami-event="download"]');
      await page.click('button[data-umami-event="download"]');
      await page.waitForSelector("a.btn.btn-sm.btn-accent.m-2.closeable-close");
      downloadLink = await page.$eval(
        "a.btn.btn-sm.btn-accent.m-2.closeable-close",
        (link) => link.getAttribute("href")
      );
    } catch (error) {
      console.error(
        "An error occurred while fetching the download link:",
        error
      );
    } finally {
      await browser.close();
    }

    return downloadLink;
  }

  // Função para inicializar o JWPlayer com a playlist dinâmica
  async function initializePlayer(imdb) {
    const movie = await fetchMovieDetails(imdb);

    if (!movie) {
      console.error("Falha ao buscar os detalhes do filme.");
      return;
    }

    // Buscar o link de download usando o hash do torrent
    const downloadLink = await fetchDownloadLink(movie.torrents[0]?.hash);

    if (!downloadLink) {
      console.error("Falha ao buscar o link de download.");
      return;
    }

    // Configuração do JWPlayer
    const updatedPlaylist = [
      {
        id: movie.id,
        title: movie.title_long,
        description: `Avaliação ${movie.rating}`,
        image: movie.background_image,
        sources: [
          {
            file: downloadLink,
            label: movie.torrents[0]?.quality || "HD",
            type: "video/mp4"
          }
        ],
        captions: [
          {
            file: "", // Adicione a URL das legendas, se disponível
            label: "Português",
            kind: "captions"
          }
        ],
        tracks: []
      }
    ];

    const playerInstance = jwplayer("player").setup({
      controls: true,
      sharing: true,
      autoload: true,
      autostart: false,
      displaytitle: true,
      displaydescription: true,
      abouttext: "Buy me a coffee ☕",
      aboutlink: "https://filmes.net.eu.org/help-us/",
      skin: {
        name: "netflix"
      },
      logo: {
        file:
          "https://lh3.googleusercontent.com/d/1y7iMJ4ph8o50bCgKYaPO_tBEMbGFkMb_?authuser=0",
        link: "https://filmes.net.eu.org"
      },
      captions: {
        color: "#efcc00",
        fontSize: 16,
        backgroundOpacity: 0,
        edgeStyle: "raised"
      },
      playlist: updatedPlaylist
    });

    playerInstance.on("ready", function () {
      const buttonId = "download-video-button";
      const iconPath =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTMgMTloMTh2Mkgzdi0yem0xMC01LjgyOEwxOS4wNzEgNy4xbDEuNDE0IDEuNDE0TDEyIDE3IDMuNTE1IDguNTE1IDQuOTI5IDcuMSAxMSAxMy4xN1YyaDJ2MTEuMTcyeiIgZmlsbD0icmdiYSgyNDcsMjQ3LDI0NywxKSIvPjwvc3ZnPg==";
      const tooltipText = "Download Video";

      // Adiciona o botão personalizado ao player
      playerInstance.addButton(
        iconPath,
        tooltipText,
        buttonClickAction,
        buttonId
      );

      // Ação do botão de download
      function buttonClickAction() {
        const playlistItem = playerInstance.getPlaylistItem();
        const anchor = document.createElement("a");
        const fileUrl = playlistItem.file;
        anchor.setAttribute("href", fileUrl);
        const downloadName = playlistItem.file.split("/").pop();
        anchor.setAttribute("download", downloadName);
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }

      // Move a timeslider na interface
      const playerContainer = playerInstance.getContainer();
      const buttonContainer = playerContainer.querySelector(
        ".jw-button-container"
      );
      const spacer = buttonContainer.querySelector(".jw-spacer");
      const timeSlider = playerContainer.querySelector(".jw-slider-time");
      buttonContainer.replaceChild(timeSlider, spacer);

      // Detecta adblock e exibe um modal
      playerInstance.off("adBlock", () => {
        const modal = document.querySelector("div.modal");
        modal.style.display = "flex";

        document
          .getElementById("close")
          .addEventListener("click", () => location.reload());
      });

      // Adiciona o botão para avançar 10 segundos
      const rewindContainer = playerContainer.querySelector(
        ".jw-display-icon-rewind"
      );
      const forwardContainer = rewindContainer.cloneNode(true);
      const forwardDisplayButton = forwardContainer.querySelector(
        ".jw-icon-rewind"
      );
      forwardDisplayButton.style.transform = "scaleX(-1)";
      forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
      const nextContainer = playerContainer.querySelector(
        ".jw-display-icon-next"
      );
      nextContainer.parentNode.insertBefore(forwardContainer, nextContainer);

      // Controle de barra para avançar 10 segundos
      const rewindControlBarButton = buttonContainer.querySelector(
        ".jw-icon-rewind"
      );
      const forwardControlBarButton = rewindControlBarButton.cloneNode(true);
      forwardControlBarButton.style.transform = "scaleX(-1)";
      forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
      rewindControlBarButton.parentNode.insertBefore(
        forwardControlBarButton,
        rewindControlBarButton.nextElementSibling
      );

      // Função de avançar 10 segundos
      [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
        button.onclick = () => {
          playerInstance.seek(playerInstance.getPosition() + 10);
        };
      });
    });
  }

  // Inicializa o player com o IMDb ID fornecido na URL
  initializePlayer(imdb);
} else {
  console.error("Nenhum IMDb ID foi informado na URL.");
}
