function fetchMovieDetails(imdbCode) {
  const apiUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbCode}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok' && data.data.movie) {
        const movie = data.data.movie;
        document.title = `${movie.title} - ${movie.year}`;
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
    magnet: `magnet:?xt=urn:btih:${hash}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce`,
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
window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const imdbCode = urlParams.get('id');
  if (imdbCode) fetchMovieDetails(imdbCode);
};