class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistsPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const id = await this._service.addPlaylist({ name, credentialId });

    const response = h.response({
      status: 'success',
      playlistId: id,
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: playlists,
    };
  }

  async deletePlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlistId = request.params;

    await this._service.deletePlaylist(credentialId, playlistId);

    return {
      status: 'success',
      message: 'Playlist deleted successfully',
    };
  }
}

module.exports = PlaylistsHandler;
