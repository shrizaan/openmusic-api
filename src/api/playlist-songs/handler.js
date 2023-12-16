class PlaylistSongs {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { playlistId } = request.params;

    const id = await this._service.addSongToPlaylist(playlistId, songId);
  }
}

module.exports = PlaylistSongs;
