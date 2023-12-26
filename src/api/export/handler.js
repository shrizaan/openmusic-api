class ExportHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylist(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { id: userId } = request.payload.credentials;
    const { targetEmail } = request.payload;
    const message = {
      userId,
      targetEmail,
    };

    await this._playlistsService.verifyPlaylistAccess(userId);
    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;
