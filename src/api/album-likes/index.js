const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'album-likes',
  version: '1.0.0',
  register: (server, { albumLikesService }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumLikesService);

    server.route(routes(albumLikesHandler));
  },
};
