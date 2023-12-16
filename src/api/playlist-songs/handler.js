class PlaylistSongs {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
  }
}

module.exports = PlaylistSongs;
