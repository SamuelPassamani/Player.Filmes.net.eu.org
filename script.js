const urlParams = new URLSearchParams(window.location.search);
const imdb = urlParams.get("imdb");

if (imdb) {
  // Função para buscar os detalhes do filme usando a API YTS
  async function fetchMovieDetails(imdb) {
    const apiUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb}&with_images=true&with_cast=true`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error("Erro ao acessar a API YTS:", response.statusText);
        return null;
      }

      const data = await response.json();
      if (data && data.status === "ok" && data.data.movie) {
        return data.data.movie;
      } else {
        console.error("Nenhum filme encontrado para o IMDb ID fornecido.");
      }
    } catch (error) {
      console.error("Erro ao acessar a API YTS:", error);
    }
    return null;
  }

  // Função para buscar o link de download usando uma API Serverless ou outro serviço
  async function fetchDownloadLink(hash) {
    if (!hash) {
      console.error("Hash do torrent não fornecido.");
      return null;
    }

    const url = `https://player.filmes.net.eu.org/.netlify/functions/fetchDownloadLink?hash=${hash}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Erro ao acessar o link de download:", response.statusText);
        return null;
      }

      const data = await response.json();
      if (data && data.downloadLink) {
        return data.downloadLink;
      } else {
        console.error("Nenhum link de download encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar o link de download:", error);
    }

    return null;
  }

  // Função para inicializar o JWPlayer com a playlist dinâmica
  async function initializePlayer(imdb) {
    const movie = await fetchMovieDetails(imdb);

    if (!movie) {
      document.body.innerHTML = "<h1>Erro: Não foi possível buscar os detalhes do filme.</h1>";
      return;
    }

    // Verificar se há torrents disponíveis
    if (!movie.torrents || !movie.torrents[0]?.hash) {
      document.body.innerHTML = "<h1>Erro: Nenhum torrent encontrado para o filme.</h1>";
      return;
    }

    // Buscar o link de download usando o hash do torrent
    const downloadLink = await fetchDownloadLink(movie.torrents[0]?.hash);

    if (!downloadLink) {
      document.body.innerHTML = "<h1>Erro: Não foi possível obter o link de download.</h1>";
      return;
    }

    // Configuração do JWPlayer
    const updatedPlaylist = [
      {
        id: movie.id,
        title: movie.title_long,
        description: `Avaliação: ${movie.rating}`,
        image: movie.background_image,
        sources: [
          {
            file: downloadLink,
            label: movie.torrents[0]?.quality || "HD",
            type: "video/mp4",
          },
        ],
        captions: [
          {
            file: "", // Adicione a URL das legendas, se disponível
            label: "Português",
            kind: "captions",
          },
        ],
        tracks: [],
      },
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
        name: "netflix",
      },
      logo: {
        file: "https://lh3.googleusercontent.com/d/1y7iMJ4ph8o50bCgKYaPO_tBEMbGFkMb_?authuser=0",
        link: "https://filmes.net.eu.org",
      },
      captions: {
        color: "#efcc00",
        fontSize: 16,
        backgroundOpacity: 0,
        edgeStyle: "raised",
      },
      playlist: updatedPlaylist,
    });

    playerInstance.on("ready", function () {
      // Adiciona o botão de download
      const buttonId = "download-video-button";
      const iconPath =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTMgMTloMTh2Mkgzdi0yem0xMC01LjgyOEwxOS4wNzEgNy4xbDEuNDE0IDEuNDE0TDEyIDE3IDMuNTE1IDguNTE1IDQuOTI5IDcuMSAxMSAxMy4xN1YyaDJ2MTEuMTcyeiIgZmlsbD0icmdiYSgyNDcsMjQ3LDI0NywxKSIvPjwvc3ZnPg==";
      const tooltipText = "Download Video";

      playerInstance.addButton(iconPath, tooltipText, () => {
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
      }, buttonId);

      // Outros ajustes no player
      const playerContainer = playerInstance.getContainer();
      const buttonContainer = playerContainer.querySelector(".jw-button-container");
      const spacer = buttonContainer.querySelector(".jw-spacer");
      const timeSlider = playerContainer.querySelector(".jw-slider-time");
      buttonContainer.replaceChild(timeSlider, spacer);
    });
  }

  // Inicializa o player com o IMDb ID fornecido na URL
  initializePlayer(imdb);
} else {
  document.body.innerHTML = "<h1>Erro: Nenhum IMDb ID foi fornecido na URL.</h1>";
}
