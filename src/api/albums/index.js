const AlbumsHandler = require('./handler');
const albumsRoutes = require('./routes');

const AlbumsPlugin = {
  name: 'albums',
  register: async (server, options) => {
    const albumsHandler = new AlbumsHandler(options.service, options.validator);

    server.route(albumsRoutes(albumsHandler));
  },
};

module.exports = AlbumsPlugin;
