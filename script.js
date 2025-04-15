class MoviePlayer {
  constructor(apiUrl, playerContainerId, buttonContainerId, toggleButtonId) {
    this.apiUrl = apiUrl;
    this.playerContainer = document.getElementById(playerContainerId);
    this.buttonContainer = document.getElementById(buttonContainerId);
    this.toggleButton = document.getElementById(toggleButtonId);
    this.inactivityTimeout = null;
    this.moviePoster = '';
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
    if (imdbCode) this.fetchMovieDetails(imdbCode);

    // Associar evento de clique ao botão "Menu"
    this.toggleButton.addEventListener('click', () => this.toggleButtonContainer());

    document.addEventListener('mousemove', () => this.resetInactivityTimeout());
    document.addEventListener('keydown', () => this.resetInactivityTimeout());
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), 3000); // 3 segundos de inatividade
  }

  fetchMovieDetails(imdbCode) {
    const url = `${this.apiUrl}?with_images=true&with_cast=true&imdb_id=${imdbCode}`;
    fetch(url)
      .then(response => response.json())
      .then(data => this.handleMovieDetails(data))
      .catch(error => {
        console.error('Error fetching movie details:', error);
        alert('Failed to fetch movie details. Please try again later.');
      });
  }

  handleMovieDetails(data) {
    if (data && data.status === 'ok' && data.data && data.data.movie) {
      const movie = data.data.movie;
      document.title = `${movie.title} - ${movie.year}`;
      this.moviePoster = movie.background_image || '';
      this.createPlayerButtons(movie.torrents);
    } else {
      alert('Movie details not found');
      console.error('Invalid API response:', data);
    }
  }

  createPlayerButtons(torrents) {
    this.buttonContainer.innerHTML = '';
    torrents.forEach((torrent, index) => {
      const button = document.createElement('button');
      button.textContent = `${torrent.quality}.${torrent.type}.${torrent.video_codec}`;
      button.setAttribute('aria-label', `Play ${torrent.quality} ${torrent.type}`);
      button.onclick = () => this.loadVideo(torrent.hash, button);
      this.buttonContainer.appendChild(button);
      if (index === 0) {
        this.loadVideo(torrent.hash, button);
      }
    });
    this.showButtonContainer();
  }

  loadVideo(hash, button) {
    this.playerContainer.innerHTML = '';
    window.webtor = window.webtor || [];
    window.webtor.push({
      id: this.playerContainer.id,
      width: '100%',
      height: '100%',
      magnet: this.buildMagnetLink(hash),
      poster: this.moviePoster,
      onReady: () => {
        console.log('Webtor player is ready');
        document.body.classList.add('background-hidden'); // Ocultar o background após o player ser carregado
      },
    });

    [...this.buttonContainer.querySelectorAll('button')].forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
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
    this.toggleButton.classList.add('fade-out');
    this.toggleButton.style.display = 'none'; // Esconder o botão "Menu" após inatividade
  }

  resetInactivityTimeout() {
    clearTimeout(this.inactivityTimeout);
    this.toggleButton.classList.remove('fade-out');
    this.toggleButton.style.display = ''; // Mostrar o botão "Menu" novamente
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), 3000); // 3 segundos de inatividade
  }

  disableShortcuts(event) {
    const forbiddenKeys = ['F12', 'I', 'J', 'U', 'S'];
    if ((event.ctrlKey && forbiddenKeys.includes(event.key.toUpperCase())) || event.key === 'F12') {
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
