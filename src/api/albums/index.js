const AlbumsHandler = require('./handler');
const albumsRoutes = require('./routes');

const AlbumsPlugin = {
  name: 'albums',
  register: async (server, {
    albumsService, storageService, albumsValidator, uploadValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      albumsValidator,
      uploadValidator,
    );

    server.route(albumsRoutes(albumsHandler));
  },
};

module.exports = AlbumsPlugin;
