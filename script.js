class MoviePlayer {
  constructor(apiUrl, playerContainerId, buttonContainerId, toggleButtonId) {
    this.apiUrl = apiUrl;
    this.playerContainer = document.getElementById(playerContainerId);
    this.buttonContainer = document.getElementById(buttonContainerId);
    this.toggleButton = document.getElementById(toggleButtonId);
    this.inactivityTimeout = null;
    this.moviePoster = '';
    this.defaultPoster = 'https://lh3.googleusercontent.com/d/1DLTzvLxRZOaXWbXFaOosYNfc9zfIWIpV?authuser=0';
    this.TRACKERS = this.initializeTrackers();
  }

  // Modularized function to initialize the list of trackers
  initializeTrackers() {
    return [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.com:2710/announce',
    ];
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const imdbCode = urlParams.get('id');
    const hash = urlParams.get('hash');

    if (this.isValidHash(hash)) {
      this.handleHashFlow(hash);
    } else if (this.isValidImdbCode(imdbCode)) {
      this.handleImdbFlow(imdbCode);
    } else {
      this.handleMissingParams();
    }

    this.setupInactivityHandler();
    this.showAdsModal(); // Exibe o modal de Ads ao iniciar
  }

  isValidHash(hash) {
    return hash && typeof hash === 'string' && hash.length === 40; // Valid hash length for torrents
  }

  isValidImdbCode(imdbCode) {
    return imdbCode && typeof imdbCode === 'string' && imdbCode.length > 0;
  }

  handleHashFlow(hash) {
    console.log('Carregando vídeo diretamente com o hash fornecido na URL.');
    this.moviePoster = this.defaultPoster;
    console.log('Poster padrão configurado para hash:', this.moviePoster);
    document.title = "MakingOff Torrent Player";
    this.loadVideo(hash);
    this.toggleMenuVisibility(false);
  }

  handleImdbFlow(imdbCode) {
    console.log('Buscando detalhes do filme com o código IMDb:', imdbCode);
    this.fetchMovieDetails(imdbCode);
    this.toggleMenuVisibility(true);
  }

  handleMissingParams() {
    console.error('Parâmetros "id" e "hash" ausentes na URL. Não é possível carregar o filme.');
    alert('Erro: Parâmetros "id" ou "hash" ausentes. Verifique a URL e tente novamente.');
  }

  toggleMenuVisibility(show) {
    if (this.toggleButton) {
      this.toggleButton.style.display = show ? 'block' : 'none';
      if (show) {
        this.toggleButton.addEventListener('click', () => this.toggleButtonContainer());
      }
    } else {
      console.warn('Botão de menu não encontrado no DOM.');
    }
  }

  setupInactivityHandler() {
    document.addEventListener('mousemove', () => this.resetInactivityTimeout());
    document.addEventListener('keydown', () => this.resetInactivityTimeout());
    const inactivityDuration = 3000; // 3 segundos
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), inactivityDuration);
  }

  fetchMovieDetails(imdbCode) {
    const url = `${this.apiUrl}?with_images=true&with_cast=true&imdb_id=${imdbCode}`;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro na resposta da API: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => this.handleMovieDetails(data))
      .catch(error => {
        console.error('Erro ao buscar detalhes do filme:', error);
        alert('Erro ao buscar detalhes do filme. Tente novamente mais tarde.');
      });
  }

  handleMovieDetails(data) {
    if (data && data.status === 'ok' && data.data && data.data.movie) {
      const movie = data.data.movie;
      this.moviePoster = movie.background_image || this.defaultPoster;
      console.log('Poster configurado como:', this.moviePoster);
      document.title = `${movie.title} - ${movie.year}`;
      this.createPlayerButtons(movie.torrents, movie.imdb_id);
    } else {
      console.error('Resposta da API inválida:', data);
      alert('Detalhes do filme não encontrados. Verifique se o código IMDb é válido.');
    }
  }

  createPlayerButtons(torrents, imdbId = null) {
    this.buttonContainer.innerHTML = '';
    if (!torrents || torrents.length === 0) {
      console.warn('Nenhum torrent encontrado para este filme.');
      alert('Nenhuma fonte de torrent disponível para este filme.');
      return;
    }

    torrents.forEach((torrent, index) => {
      const button = document.createElement('button');
      button.textContent = `${torrent.quality}.${torrent.type}.${torrent.video_codec}`;
      button.setAttribute('aria-label', `Reproduzir ${torrent.quality} ${torrent.type}`);
      button.classList.add('fade-in');
      button.onclick = () => this.loadVideo(torrent.hash, button, imdbId);
      this.buttonContainer.appendChild(button);

      if (index === 0) {
        console.log('Carregando automaticamente o primeiro torrent:', torrent);
        this.loadVideo(torrent.hash, button, imdbId);
      }
    });

    this.showButtonContainer();
  }

  loadVideo(hash, button = null, imdbId = null) {
    this.playerContainer.innerHTML = '';
    const magnetLink = this.buildMagnetLink(hash);

    console.log('Link magnet gerado:', magnetLink);

    window.webtor = window.webtor || [];
    window.webtor.push({
      id: this.playerContainer.id,
      width: '100%',
      height: '100%',
      magnet: magnetLink,
      poster: this.moviePoster,
      lang: 'pt',
      userLang: 'pt',
      imdbId: imdbId,
      features: {
        autoSubtitles: true,
        continue: true,
        embed: false,
        title: false,
        p2pProgress: false,
        subtitles: true,
        settings: false,
        fullscreen: true,
        chromecast: true,
      },
      onReady: () => {
        console.log('Player Webtor inicializado com sucesso.');
        document.body.classList.add('background-hidden');
      },
      onError: (error) => {
        console.error('Erro ao inicializar o player Webtor:', error);
        alert('Erro ao carregar o player. Tente novamente mais tarde.');
      },
    });

    if (button) {
      this.highlightSelectedButton(button);
    }
    this.hideButtonContainer();
  }

  showAdsModal() {
    const modal = document.getElementById('ads-modal');
    const closeBtn = document.getElementById('close-ads-btn');
    const countdownTimer = document.getElementById('countdown-timer');

    let countdown = 15;

    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        countdownTimer.textContent = `Aguarde ${countdown} segundos...`;
      } else {
        clearInterval(interval);
        countdownTimer.textContent = "Clique em 'Fechar Ads' para continuar";
        closeBtn.textContent = "Fechar Ads";
        closeBtn.disabled = false;
      }
    }, 1000);

    closeBtn.onclick = () => {
      if (!closeBtn.disabled) {
        modal.classList.add('hidden');
        this.playerContainer.style.pointerEvents = 'auto'; // Libera o player
      }
    };

    modal.classList.remove('hidden');
    this.playerContainer.style.pointerEvents = 'none'; // Bloqueia o player
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const moviePlayer = new MoviePlayer(
    'https://yts.mx/api/v2/movie_details.json',
    'webtor-player',
    'button-container',
    'toggle-btn'
  );
  moviePlayer.init();

  document.addEventListener('keydown', event => moviePlayer.disableShortcuts(event));
});