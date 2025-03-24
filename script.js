let inactivityTimeout;

function fetchMovieDetails(imdbCode) {
  const apiUrl = `https://yts.mx/api/v2/movie_details.json?with_images=true&with_cast=true&imdb_id=${imdbCode}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok' && data.data.movie) {
        const movie = data.data.movie;
        document.title = `${movie.title_long}`;
        moviePoster = movie.background_image || '';
        createPlayerButtons(movie.torrents, imdbCode);
      } else {
        alert('Movie details not found');
      }
    })
    .catch(error => console.error('Error fetching movie details:', error));
}

function createPlayerButtons(torrents, imdbCode) {
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';
  torrents.forEach((torrent, index) => {
    const button = document.createElement('button');
    button.textContent = `${torrent.quality}.${torrent.type}.${torrent.video_codec}`;
    button.onclick = (event) => loadVideo(torrent.hash, event.target);
    buttonContainer.appendChild(button);
    if (index === 0) {
      loadVideo(torrent.hash, button);
    }
  });
  showButtonContainer();
}

function loadVideo(hash, button) {
  const playerContainer = document.getElementById('webtor-player');
  playerContainer.innerHTML = '';
  window.webtor = window.webtor || [];
  window.webtor.push({
    id: 'webtor-player',
    width: '100%',
    height: '100%',
    magnet: `magnet:?xt=urn:btih:${hash}&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.com%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.mywaifu.best%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.qu.ax%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.skynetcloud.site%3A6969%2Fannounce&tr=udp%3A%2F%2Fttk2.nbaonlineservice.com%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.privateseedbox.xyz%3A2710%2Fannounce&tr=udp%3A%2F%2Fevan.im%3A6969%2Fannounce&tr=https%3A%2F%2Ftracker.yemekyedim.com%3A443%2Fannounce&tr=https%3A%2F%2Ftracker.bjut.jp%3A443%2Fannounce&tr=udp%3A%2F%2Fismaarino.com%3A1234%2Fannounce&tr=https%3A%2F%2Ftracker.leechshield.link%3A443%2Fannounce&tr=https%3A%2F%2Ftr.zukizuki.org%3A443%2Fannounce&tr=http%3A%2F%2Ffleira.no%3A6969%2Fannounce&tr=udp%3A%2F%2Fudp.tracker.projectk.org%3A23333%2Fannounce&tr=https%3A%2F%2Ftracker.aburaya.live%3A443%2Fannounce&tr=https%3A%2F%2Ftracker.zhuqiy.top%3A443%2Fannounce&tr=http%3A%2F%2Flucke.fenesisu.moe%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.renfei.net%3A8080%2Fannounce&tr=https%3A%2F%2Ftracker.guguan.dpdns.org%3A443%2Fannounce&tr=udp%3A%2F%2Fd40969.acod.regrucolo.ru%3A6969%2Fannounce&tr=udp%3A%2F%2Fp2p.publictracker.xyz%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.beeimg.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Fretracker.lanta.me%3A2710%2Fannounce&tr=http%3A%2F%2Ftaciturn-shadow.spb.ru%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.valete.tf%3A9999%2Fannounce&tr=http%3A%2F%2Ftracker.bt4g.com%3A2095%2Fannounce&tr=udp%3A%2F%2Ftracker.0x7c0.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fmartin-gebhardt.eu%3A25%2Fannounce&tr=udp%3A%2F%2Ftracker.tryhackx.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fbandito.byterunner.io%3A6969%2Fannounce&tr=http%3A%2F%2Fbt.okmp3.ru%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.gmi.gd%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.gigantino.net%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.kmzs123.cn%3A17272%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.srv00.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=http%3A%2F%2Ftracker.ipv6tracker.ru%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.darkness.services%3A6969%2Fannounce&tr=https%3A%2F%2Ftracker.lilithraws.org%3A443%2Fannounce&tr=http%3A%2F%2Fipv6.rer.lol%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.kmzs123.top%3A17272%2Fannounce&tr=http%3A%2F%2Ftorrent.hificode.in%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.fnix.net%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.netmap.top%3A6969%2Fannounce&tr=http%3A%2F%2F4.tracker.devnak.win%3A6969%2Fannounce&tr=udp%3A%2F%2Fretracker.hotplug.ru%3A2710%2Fannounce&tr=udp%3A%2F%2Fopentracker.io%3A6969%2Fannounce&tr=http%3A%2F%2Fbt1.archive.org%3A6969%2Fannounce&tr=http%3A%2F%2Fbt2.archive.org%3A6969%2Fannounce&dn=Filmes.net.eu.org+%2F+${movie.title_long}+%2F+${torrent.quality}`,
    poster: moviePoster,
    onReady: function() {
      console.log('Webtor player is ready');
    }
  });
  document.querySelectorAll('.button-container button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  hideButtonContainer();
}

function toggleButtonContainer() {
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.classList.toggle('visible');
}

function showButtonContainer() {
  document.getElementById('button-container').classList.add('visible');
}

function hideButtonContainer() {
  document.getElementById('button-container').classList.remove('visible');
}

function disableShortcuts(event) {
  const forbiddenKeys = ['F12', 'I', 'J', 'U', 'S'];
  if ((event.ctrlKey && forbiddenKeys.includes(event.key.toUpperCase())) || event.key === 'F12') {
    event.preventDefault();
    return false;
  }
}

function handleInactivity() {
  const toggleBtn = document.getElementById('toggle-btn');
  toggleBtn.classList.add('fade-out');
}

function resetInactivityTimeout() {
  clearTimeout(inactivityTimeout);
  const toggleBtn = document.getElementById('toggle-btn');
  toggleBtn.classList.remove('fade-out');
  inactivityTimeout = setTimeout(handleInactivity, 3000); // 3 segundos de inatividade
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const imdbCode = urlParams.get('id');
  if (imdbCode) fetchMovieDetails(imdbCode);

  document.addEventListener('mousemove', resetInactivityTimeout);
  document.addEventListener('keydown', resetInactivityTimeout);
  inactivityTimeout = setTimeout(handleInactivity, 3000); // 3 segundos de inatividade
};