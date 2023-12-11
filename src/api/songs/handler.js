class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    const songId = await this._service.addSong({
      title, year, genre, performer, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    let songs = await this._service.getSongs();

    if (title) {
      const words = title.split(' ');
      words.forEach((word) => {
        songs = songs.filter((song) => song.title.toLowerCase().includes(word.toLowerCase()));
      });
    }

    if (performer) {
      const words = performer.split(' ');
      words.forEach((word) => {
        songs = songs.filter((song) => song.performer.toLowerCase().includes(word.toLowerCase()));
      });
    }

    songs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });
    response.code(200);
    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });
    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    await this._service.editSongById(id, {
      title, year, genre, performer, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Song updated successfully',
    });
    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'The song has been successfully deleted',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
