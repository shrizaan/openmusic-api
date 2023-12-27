class PlaylistSongsHandler {
  constructor(
    playlistSongsService,
    playlistActivitiesService,
    validator,
  ) {
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this._playlistSongsService.addSongToPlaylist(playlistId, songId, credentialId);
    await this._playlistActivitiesService.addPlaylistActivity({
      playlistId, songId, userId: credentialId, action: 'add', time: new Date(),
    });

    const response = h.response({
      status: 'success',
      message: 'Successfully added songs to playlist.',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    const result = await this._playlistSongsService.getSongsFromPlaylist(playlistId, credentialId);

    return {
      status: 'success',
      data: {
        playlist: result,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId, credentialId);
    await this._playlistActivitiesService.addPlaylistActivity({
      playlistId, songId, userId: credentialId, action: 'delete', time: new Date(),
    });

    return {
      status: 'success',
      message: 'The song has been successfully removed from the playlist.',
    };
  }
}

module.exports = PlaylistSongsHandler;
