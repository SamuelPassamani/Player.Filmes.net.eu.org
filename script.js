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
    // Validação dos elementos do DOM
    if (!this.playerContainer || !this.buttonContainer) {
      this.showError('Elementos do player ou dos botões não encontrados no DOM.');
      throw new Error('Elementos do player ou dos botões não encontrados no DOM.');
    }
  }

  // Modularized function to initialize the list of trackers
  initializeTrackers() {
    return [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.com:2710/announce',
      'udp://1c.premierzal.ru:6969/announce',
      'udp://6ahddutb1ucc3cp.ru:6969/announce',
      'udp://bandito.byterunner.io:6969/announce',
      'udp://bt.bontal.net:6969/announce',
      'udp://d40969.acod.regrucolo.ru:6969/announce',
      'udp://evan.im:6969/announce',
      'udp://exodus.desync.com:6969',
      'udp://extracker.dahrkael.net:6969/announce',
      'udp://ipv4.tracker.harry.lu:80/announce',
      'udp://martin-gebhardt.eu:25/announce',
      'udp://open.demonii.com:1337/announce',
      'udp://open.stealth.si:80/announce',
      'udp://opentracker.io:6969/announce',
      'udp://p4p.arenabg.com:1337/announce',
      'udp://retracker.hotplug.ru:2710/announce',
      'udp://retracker.lanta.me:2710/announce',
      'udp://retracker01-msk-virt.corbina.net:80/announce',
      'udp://tr4ck3r.duckdns.org:6969/announce',
      'udp://tracker-de-2.cutie.dating:1337/announce',
      'udp://tracker.bitcoinindia.space:6969/announce',
      'udp://tracker.cloudbase.store:1333/announce',
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://tracker.cyberia.is:6969/announce',
      'udp://tracker.dler.com:6969/announce',
      'udp://tracker.dler.org:6969/announce',
      'udp://tracker.ducks.party:1984/announce',
      'udp://tracker.fnix.net:6969/announce',
      'udp://tracker.gigantino.net:6969/announce',
      'udp://tracker.hifitechindia.com:6969/announce',
      'udp://tracker.openbittorrent.com:6969/announce',
      'udp://tracker.opentrackr.org:1337',
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://tracker.plx.im:6969/announce',
      'udp://tracker.rescuecrew7.com:1337/announce',
      'udp://tracker.skillindia.site:6969/announce',
      'udp://tracker.srv00.com:6969/announce',
      'udp://tracker.startwork.cv:1337/announce',
      'udp://tracker.therarbg.to:6969/announce',
      'udp://tracker.tiny-vps.com:6969/announce',
      'udp://tracker.torrent.eu.org:451/announce',
      'udp://tracker.tryhackx.org:6969/announce',
      'udp://tracker.tvunderground.org.ru:3218/announce',
      'udp://tracker.valete.tf:9999/announce',
      'udp://tracker.zupix.online:1333/announce',
      'udp://ttk2.nbaonlineservice.com:6969/announce',
      'udp://www.torrent.eu.org:451/announce',
      'http://0123456789nonexistent.com:80/announce',
      'http://bt.okmp3.ru:2710/announce',
      'http://bt1.archive.org:6969/announce',
      'http://bt2.archive.org:6969/announce',
      'http://ipv4.rer.lol:2710/announce',
      'http://ipv6.rer.lol:6969/announce',
      'http://lucke.fenesisu.moe:6969/announce',
      'http://open.trackerlist.xyz:80/announce',
      'http://p4p.arenabg.com:1337/announce',
      'http://shubt.net:2710/announce',
      'http://torrent.hificode.in:6969/announce',
      'http://tracker.beeimg.com:6969/announce',
      'http://tracker.bt4g.com:2095/announce',
      'http://tracker.ipv6tracker.ru:80/announce',
      'http://tracker.mywaifu.best:6969/announce',
      'http://tracker.renfei.net:8080/announce',
      'https://1.tracker.eu.org:443/announce',
      'https://2.tracker.eu.org:443/announce',
      'https://3.tracker.eu.org:443/announce',
      'https://4.tracker.eu.org:443/announce',
      'https://opentracker.i2p.rocks:443/announce',
      'https://torrent.tracker.durukanbal.com:443/announce',
      'https://tr.nyacat.pw:443/announce',
      'https://tracker.alaskantf.com:443/announce',
      'https://tracker.expli.top:443/announce',
      'https://tracker.jdx3.org:443/announce',
      'https://tracker.moeblog.cn:443/announce',
      'https://tracker.yemekyedim.com:443/announce',
      'https://tracker.zhuqiy.top:443/announce',
      'wss://tracker.btorrent.xyz',
      'wss://tracker.fastcast.nz',
      'wss://tracker.openwebtorrent.com'
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
    this.showError('Erro: Parâmetros "id" ou "hash" ausentes. Verifique a URL e tente novamente.');
  }

  showError(message) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.setAttribute('role', 'alert');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '10px';
      errorDiv.style.left = '50%';
      errorDiv.style.transform = 'translateX(-50%)';
      errorDiv.style.background = '#f44336';
      errorDiv.style.color = '#fff';
      errorDiv.style.padding = '10px 20px';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.borderRadius = '5px';
      document.body.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    setTimeout(() => {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }, 5000);
    errorDiv.style.display = 'block';
  }

  toggleMenuVisibility(show) {
    if (this.toggleButton) {
      this.toggleButton.style.display = show ? 'block' : 'none';
      this.toggleButton.removeEventListener('click', this._toggleMenuHandler);
      if (show) {
        this._toggleMenuHandler = () => this.toggleButtonContainer();
        this.toggleButton.addEventListener('click', this._toggleMenuHandler);
      }
    } else {
      console.warn('Botão de menu não encontrado no DOM.');
    }
  }

  setupInactivityHandler() {
    document.addEventListener('mousemove', () => this.resetInactivityTimeout());
    document.addEventListener('keydown', () => this.resetInactivityTimeout());
    this.resetInactivityTimeout();
  }

  resetInactivityTimeout() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    const inactivityDuration = 3000;
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), inactivityDuration);
  }

  handleInactivity() {
    // Exemplo: ocultar controles do player
    if (this.buttonContainer) {
      this.buttonContainer.style.opacity = '0.3';
    }
    if (this.toggleButton) {
      this.toggleButton.style.opacity = '0.3';
    }
  }

  fetchMovieDetails(imdbCode) {
    const url = `${this.apiUrl}?with_images=true&with_cast=true&imdb_id=${encodeURIComponent(imdbCode)}`;
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
        this.showError('Erro ao buscar detalhes do filme. Tente novamente mais tarde.');
      });
  }

  handleMovieDetails(data) {
    if (data && data.status === 'ok' && data.data && data.data.movie) {
      const movie = data.data.movie;
      // Sanitização básica
      const title = String(movie.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const year = String(movie.year || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      this.moviePoster = movie.background_image || this.defaultPoster;
      console.log('Poster configurado como:', this.moviePoster);
      document.title = `${title} - ${year}`;
      this.createPlayerButtons(movie.torrents, movie.imdb_id);
    } else {
      console.error('Resposta da API inválida:', data);
      this.showError('Detalhes do filme não encontrados. Verifique se o código IMDb é válido.');
    }
  }

  createPlayerButtons(torrents, imdbId = null) {
    this.buttonContainer.innerHTML = '';
    if (!torrents || torrents.length === 0) {
      console.warn('Nenhum torrent encontrado para este filme.');
      this.showError('Nenhuma fonte de torrent disponível para este filme.');
      return;
    }
    let firstLoaded = false;
    torrents.forEach((torrent, index) => {
      const button = document.createElement('button');
      button.textContent = `${torrent.quality}.${torrent.type}.${torrent.video_codec}`;
      button.setAttribute('aria-label', `Reproduzir ${torrent.quality} ${torrent.type}`);
      button.classList.add('fade-in');
      button.setAttribute('tabindex', '0');
      button.onclick = () => this.loadVideo(torrent.hash, button, imdbId);
      this.buttonContainer.appendChild(button);
      if (index === 0 && !firstLoaded) {
        firstLoaded = true;
        console.log('Carregando automaticamente o primeiro torrent:', torrent);
        this.loadVideo(torrent.hash, button, imdbId);
      }
    });
    this.showButtonContainer();
  }

  buildMagnetLink(hash) {
    // Monta o magnet link usando os trackers
    let magnet = `magnet:?xt=urn:btih:${hash}`;
    this.TRACKERS.forEach(tracker => {
      magnet += `&tr=${encodeURIComponent(tracker)}`;
    });
    return magnet;
  }

  highlightSelectedButton(button) {
    // Remove destaque dos outros botões
    Array.from(this.buttonContainer.children).forEach(btn => {
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
  }

  showButtonContainer() {
    this.buttonContainer.style.display = 'block';
    this.buttonContainer.style.opacity = '1';
  }

  hideButtonContainer() {
    this.buttonContainer.style.display = 'none';
  }

  toggleButtonContainer() {
    if (this.buttonContainer.style.display === 'none' || this.buttonContainer.style.opacity === '0.3') {
      this.showButtonContainer();
      this.buttonContainer.style.opacity = '1';
      if (this.toggleButton) this.toggleButton.style.opacity = '1';
    } else {
      this.hideButtonContainer();
    }
  }

  disableShortcuts(event) {
    // Exemplo: desabilitar F12, Ctrl+U, Ctrl+Shift+I
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.key.toLowerCase() === 'u') ||
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i')
    ) {
      event.preventDefault();
      this.showError('Atalho desabilitado nesta página.');
    }
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
        this.showError('Erro ao carregar o player. Tente novamente mais tarde.');
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
    if (!modal || !closeBtn || !countdownTimer) {
      this.showError('Elementos do modal de anúncios não encontrados.');
      return;
    }
    let countdown = 15;
    closeBtn.setAttribute('aria-disabled', 'true');
    closeBtn.setAttribute('tabindex', '0');
    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        countdownTimer.textContent = `Aguarde ${countdown} segundos...`;
      } else {
        clearInterval(interval);
        countdownTimer.textContent = "Clique em 'Fechar Ads' para continuar";
        closeBtn.textContent = "Fechar Ads";
        closeBtn.disabled = false;
        closeBtn.setAttribute('aria-disabled', 'false');
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
