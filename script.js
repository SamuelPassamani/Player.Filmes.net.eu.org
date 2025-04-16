class MoviePlayer {
  constructor(apiUrl, playerContainerId, buttonContainerId, toggleButtonId) {
    this.apiUrl = apiUrl;
    this.playerContainer = document.getElementById(playerContainerId);
    this.buttonContainer = document.getElementById(buttonContainerId);
    this.toggleButton = document.getElementById(toggleButtonId);
    this.inactivityTimeout = null;
    this.moviePoster = '';
    this.defaultPoster = 'https://lh3.googleusercontent.com/d/1DLTzvLxRZOaXWbXFaOosYNfc9zfIWIpV?authuser=0';
    this.TRACKERS = [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.com:2710/announce',
      'udp://p4p.arenabg.com:1337/announce',
      'udp://tracker.leechers-paradise.org:6969',
      'udp://tracker.internetwarriors.net:1337',
      'udp://tracker.opentrackr.org:1337/announce',
      'http://tracker.mywaifu.best:6969/announce',
      'udp://open.demonii.com:1337/announce',
      'udp://tracker.qu.ax:6969/announce',
      'udp://tracker.skynetcloud.site:6969/announce',
      'udp://ttk2.nbaonlineservice.com:6969/announce',
      'http://tracker.privateseedbox.xyz:2710/announce',
      'udp://evan.im:6969/announce',
      'https://tracker.yemekyedim.com:443/announce',
      'https://tracker.bjut.jp:443/announce',
      'udp://ismaarino.com:1234/announce',
      'https://tracker.leechshield.link:443/announce',
      'https://tr.zukizuki.org:443/announce',
      'http://fleira.no:6969/announce',
      'udp://udp.tracker.projectk.org:23333/announce',
      'https://tracker.aburaya.live:443/announce',
      'https://tracker.zhuqiy.top:443/announce',
      'http://lucke.fenesisu.moe:6969/announce',
      'http://tracker.renfei.net:8080/announce',
      'https://tracker.guguan.dpdns.org:443/announce',
      'udp://d40969.acod.regrucolo.ru:6969/announce',
      'udp://p2p.publictracker.xyz:6969/announce',
      'http://tracker.beeimg.com:6969/announce',
      'udp://tracker.valete.tf:9999/announce',
      'http://tracker.bt4g.com:2095/announce',
      'udp://tracker.0x7c0.com:6969/announce',
      'udp://martin-gebhardt.eu:25/announce',
      'udp://tracker.tryhackx.org:6969/announce',
      'udp://bandito.byterunner.io:6969/announce',
      'http://bt.okmp3.ru:2710/announce',
      'udp://tracker.gmi.gd:6969/announce',
      'udp://tracker.gigantino.net:6969/announce',
      'udp://tracker.kmzs123.cn:17272/announce',
      'udp://tracker.dler.com:6969/announce',
      'udp://tracker.srv00.com:6969/announce',
      'udp://open.stealth.si:80/announce',
      'http://tracker.ipv6tracker.ru:80/announce',
      'udp://tracker.darkness.services:6969/announce',
      'https://tracker.lilithraws.org:443/announce',
      'http://ipv6.rer.lol:6969/announce',
      'udp://tracker.kmzs123.top:17272/announce',
      'http://torrent.hificode.in:6969/announce',
      'udp://tracker.torrent.eu.org:451/announce',
      'udp://tracker.fnix.net:6969/announce',
      'http://tracker.netmap.top:6969/announce',
      'http://4.tracker.devnak.win:6969/announce',
      'udp://retracker.hotplug.ru:2710/announce',
      'udp://opentracker.io:6969/announce',
      'http://bt1.archive.org:6969/announce',
      'http://bt2.archive.org:6969/announce',
    ];
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const imdbCode = urlParams.get('id');
    const hash = urlParams.get('hash');

    if (hash) {
      console.log('Carregando vídeo diretamente com o hash fornecido na URL.');
      this.moviePoster = this.defaultPoster; // Carrega a imagem padrão para 'hash'
      console.log('Poster padrão configurado para hash:', this.moviePoster);
      document.title = "MakingOff Torrent Player"; // Atualiza o título para "hash"
      this.loadVideo(hash);

      // Ocultar o botão de menu quando o parâmetro "hash" estiver presente
      if (this.toggleButton) {
        this.toggleButton.style.display = 'none';
      } else {
        console.warn('Botão de menu não encontrado no DOM.');
      }
    } else if (imdbCode) {
      console.log('Buscando detalhes do filme com o código IMDb: ', imdbCode);
      this.fetchMovieDetails(imdbCode);

      // Mostrar o botão de menu e configurar o evento de clique
      if (this.toggleButton) {
        this.toggleButton.style.display = 'block';
        this.toggleButton.addEventListener('click', () => this.toggleButtonContainer());
      } else {
        console.warn('Botão de menu não encontrado no DOM.');
      }
    } else {
      console.error('Parâmetros "id" e "hash" ausentes na URL. Não é possível carregar o filme.');
      alert('Erro: Parâmetros "id" ou "hash" ausentes. Verifique a URL e tente novamente.');
    }

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

      // Log para verificar se background_image está presente
      console.log('Imagem de fundo recebida da API:', movie.background_image);

      // Atribuir o valor ou exibir um aviso caso esteja ausente
      if (movie.background_image) {
        this.moviePoster = movie.background_image;
      } else {
        console.warn('Nenhuma imagem de fundo encontrada. Usando fallback vazio.');
        this.moviePoster = '';
      }

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
      lang: 'pt', // Configuração de idioma
      userLang: 'pt', // Configuração de idioma do usuário
      imdbId: imdbCode, // Configuração de IMDb
      header: 'false',
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
      [...this.buttonContainer.querySelectorAll('button')].forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    }
    this.hideButtonContainer();
  }

  buildMagnetLink(hash) {
    return `magnet:?xt=urn:btih:${hash}&tr=${this.TRACKERS.map(encodeURIComponent).join('&tr=')}`;
  }

  toggleButtonContainer() {
    this.buttonContainer.classList.toggle('visible');
  }

  showButtonContainer() {
    this.buttonContainer.classList.add('visible');
  }

  hideButtonContainer() {
    this.buttonContainer.classList.remove('visible');
  }

  handleInactivity() {
    console.log('Usuário inativo. Ocultando botões e controles.');
    this.toggleButton.classList.add('fade-out');
    this.buttonContainer.classList.add('fade-out');
  }

  resetInactivityTimeout() {
    clearTimeout(this.inactivityTimeout);
    console.log('Atividade detectada. Restaurando botões e controles.');
    this.toggleButton.classList.remove('fade-out');
    this.buttonContainer.classList.remove('fade-out');
    const inactivityDuration = 3000; // 3 segundos
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), inactivityDuration);
  }

  disableShortcuts(event) {
    const forbiddenKeys = ['F12', 'I', 'J', 'U', 'S'];
    if ((event.ctrlKey && forbiddenKeys.includes(event.key.toUpperCase())) || event.key === 'F12') {
      console.warn('Atalho desativado:', event.key);
      event.preventDefault();
      return false;
    }
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
