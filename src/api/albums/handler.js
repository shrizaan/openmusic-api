const config = require('../../utils/config');

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

  async postAlbumCoverByIdHandler(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    this._uploadValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const fileUrl = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`;

    await this._albumsService.editAlbumById(albumId, { cover: fileUrl });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const result = await this._albumsService.getAllSongsFromAlbum(id);

    const response = h.response({
      status: 'success',
      data: result,
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);

    const { name, year, cover } = request.payload;
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, { name, year, cover });

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
