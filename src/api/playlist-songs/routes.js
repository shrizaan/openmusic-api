const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongToPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getSongsFromPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.deleteSongFromPlaylistByIdHandler(request, h),
    options: {
      auth: 'musicapi_jwt',
    },
  },
];

module.exports = routes;
