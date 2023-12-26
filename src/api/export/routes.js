const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: (request, h) => handler.postExportPlaylist(request, h),
    options: {
      auth: 'musicapi_jwt',
    },
  },
];

module.exports = routes;
