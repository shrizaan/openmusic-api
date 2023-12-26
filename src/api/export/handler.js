class ExportHandler {
  constructor(producerService, validator) {
    this._producerService = producerService;
    this._validator = validator;
  }

  async postExportPlaylist(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const message = {
      userId: request.payload.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

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
