const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbumLike(albumId, userId) {
    const id = `album-likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album_likes(id, user_id, album_id) VALUES($1, $2) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add likes to the album.');
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: 'SELECT * FROM album_likes JOIN albums ON album_likes.album_id = albums.id WHERE album_likes.album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete likes on album.');
    }
  }
}

module.exports = AlbumLikesService;
