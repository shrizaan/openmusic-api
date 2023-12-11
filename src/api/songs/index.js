const SongsHandler = require('./handler');
const songRoutes = require('./routes');

const songsPlugin = {
  name: 'songs',
  register: async (server, options) => {
    const songsHandler = new SongsHandler(options.service, options.validator);

    server.route(songRoutes(songsHandler));
  },
};

module.exports = songsPlugin;
