require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

const SongsService = require('./services/postgres/SongsService');
const songsValidator = require('./validator/songs/index');
const songsPlugin = require('./api/songs/index');

const AlbumsService = require('./services/postgres/AlbumsService');
const albumsValidator = require('./validator/albums/index');
const albumsPlugin = require('./api/albums/index');

const UsersService = require('./services/postgres/UsersService');
const usersValidator = require('./validator/users/index');
const usersPlugin = require('./api/users/index');

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

  const albumsServices = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();

  await server.register([
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
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
    {
      plugin: usersPlugin,
      options: {
        service: usersService,
        validator: usersValidator,
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
