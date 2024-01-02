const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(albumId, userId) {
    await this.searchAlbum(albumId);
    await this.checkAlbumLike(albumId, userId);

    const id = `album-likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album_likes(id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add likes to the album.');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return {
        result: JSON.parse(result),
        fromCache: true,
      };
    } catch (error) {
      await this.searchAlbum(albumId);

      const query = {
        text: 'SELECT * FROM album_likes JOIN albums ON album_likes.album_id = albums.id WHERE album_likes.album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(result.rows.length));

      return {
        result: result.rows.length,
        fromCache: false,
      };
    }
  }

  async deleteAlbumLike(albumId, userId) {
    await this.searchAlbum(albumId);

    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete likes on album.');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async searchAlbum(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to add likes to the album. Album ID not found.');
    }
  }

  async checkAlbumLike(albumId, userId) {
    const query = {
      text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 1) {
      throw new InvariantError('Failed to add likes. Like has been added.');
    }
  }
}

module.exports = AlbumLikesService;
