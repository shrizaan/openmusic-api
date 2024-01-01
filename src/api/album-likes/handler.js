class AlbumLikesHandler {
  constructor(albumLikesService) {
    this._albumLikesService = albumLikesService;
  }

  async postAlbumLikeByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.addAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Successfully added like to the album.',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.paramss;

    const result = await this._albumLikesService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: result,
      },
    });
    response.code(200);
    return response;
  }

  async deleteAlbumLikeByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.deleteAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Successfully deleted likes on the album.',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumLikesHandler;
