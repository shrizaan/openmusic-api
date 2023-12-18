const PlaylistActivities = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist-activities',
  version: '1.0.0',
  register: (server, { service }) => {
    const playlistActivitiesHandler = new PlaylistActivities(service);
    server.route(routes(playlistActivitiesHandler));
  },
};
