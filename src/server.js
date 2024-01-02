require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

const path = require('path');
const ClientError = require('./exceptions/ClientError');

// Song Plugin
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs/index');
const songsPlugin = require('./api/songs/index');

// Album Plugin
const StorageService = require('./services/storage/StorageService');
const UploadValidator = require('./validator/upload/index');

const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums/index');
const albumsPlugin = require('./api/albums/index');

// User Plugin
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users/index');
const usersPlugin = require('./api/users/index');

// Authentication Plugin
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications/index');
const authenticationsPlugin = require('./api/authentications/index');
const TokenManager = require('./tokenize/TokenManager');

// Playlist Plugin
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists/index');
const playlistsPlugin = require('./api/playlists/index');

// PlaylistSong Plugin
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlist-songs');
const playlistSongsPlugin = require('./api/playlist-songs');

// Collaboration Plugin
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations/index');
const collaborationsPlugin = require('./api/collaborations/index');

// PlaylistActivities Plugin
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');
const playlistActivitiesPlugin = require('./api/activities/index');

// Export Plugin
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportValidator = require('./validator/export/index');
const exportPlugin = require('./api/export/index');

// Album Likes Plugin
const AlbumLikesService = require('./services/postgres/AlbumLikesService');
const albumLikesPlugin = require('./api/album-likes/index');

// Cache Service
const CacheService = require('./services/redis/CacheService');

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

  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images/'));
  const cacheService = new CacheService();

  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService(playlistsService, cacheService);
  const playlistActivitiesService = new PlaylistActivitiesService(playlistsService);
  const albumLikesService = new AlbumLikesService(cacheService);

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('musicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albumsPlugin,
      options: {
        albumsService,
        storageService,
        albumsValidator: AlbumsValidator,
        uploadValidator: UploadValidator,
      },
    },
    {
      plugin: usersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlistsPlugin,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSongsPlugin,
      options: {
        playlistSongsService,
        playlistActivitiesService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: playlistActivitiesPlugin,
      options: {
        service: playlistActivitiesService,
      },
    },
    {
      plugin: collaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportPlugin,
      options: {
        producerService: ProducerService,
        playlistsService,
        validator: ExportValidator,
      },
    },
    {
      plugin: albumLikesPlugin,
      options: {
        albumLikesService,
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
