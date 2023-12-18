const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) => handler.getPlaylistActivitiesHandler(request, h),
    options: {
      auth: 'musicapi_jwt',
    },
  },
];

module.exports = routes;
