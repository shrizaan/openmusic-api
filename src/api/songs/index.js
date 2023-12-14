const SongsHandler = require('./handler');
const songRoutes = require('./routes');

const SongsPlugin = {
  name: 'songs',
  register: async (server, options) => {
    const songsHandler = new SongsHandler(options.service, options.validator);

    server.route(songRoutes(songsHandler));
  },
};

module.exports = SongsPlugin;
