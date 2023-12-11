const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const ClientError = require('./exceptions/ClientError');
const albumsValidator = require('./validator/albums/index');
const songsValidator = require('./validator/songs/index');
const albumsPlugin = require('./api/albums/index');
const songsPlugin = require('./api/songs/index');
const SongsServices = require('./services/postgres/SongsServices');
const AlbumsServices = require('./services/postgres/AlbumsServices');

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const albumsServices = new AlbumsServices();
  const songsServices = new SongsServices();

  await server.register([
    {
      plugin: songsPlugin,
      options: {
        service: songsServices,
        validator: songsValidator,
      },
    },
    {
      plugin: albumsPlugin,
      options: {
        service: albumsServices,
        validator: albumsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'There was a failure on our server',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`The server runs on ${server.info.uri}`);
};

init();
