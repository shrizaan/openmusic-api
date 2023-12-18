class PlaylistActivities {
  constructor(service) {
    this._service = service;
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const playlistActivities = await this._service.getPlaylistActivities(playlistId, credentialId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities: playlistActivities,
      },
    };
  }
}

module.exports = PlaylistActivities;
