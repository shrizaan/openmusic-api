const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist_songs',
  version: '1.0.0',
  register: (server, {
    playlistSongsService,
    playlistActivitiesService, validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistSongsService,
      playlistActivitiesService,
      validator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
