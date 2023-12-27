class AlbumsHandler {
  constructor(albumsService, storageService, albumsValidator, uploadValidator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsValidator = albumsValidator;
    this._uploadValidator = uploadValidator;
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postAlbumCoverByIdHander(request, h) {
    const { data } = request.payload;

    this._storageService.validateImageHeaders(data.hapi.headers);

    await this._uploadValidator.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._albumsService.getAllSongsFromAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, { name, year });

    const response = h.response({
      status: 'success',
      message: 'Album updated successfully',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'The album has been successfully deleted',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
