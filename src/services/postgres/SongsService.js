const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBSongToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add.');
    }

    await this._cacheService.delete(`album-songs:${albumId}`);
    await this._cacheService.delete('songs');

    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const result = await this._cacheService.get('songs');
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs',
      };

      const result = await this._pool.query(query);
      await this._cacheService.set('songs', JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found.');
    }

    return result.rows.map(mapDBSongToModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update. ID not found.');
    }

    await this._cacheService.delete(`album-songs:${albumId}`);
    await this._cacheService.delete('songs');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id, album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete. ID not found.');
    }

    await this._cacheService.delete(`album-songs:${result.rows[0].album_id}`);
    await this._cacheService.delete('songs');
  }
}

module.exports = SongsService;
