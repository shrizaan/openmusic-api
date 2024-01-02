const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to add.');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found.');
    }

    return result.rows.map(({
      id: albumId, name, year, cover,
    }) => ({
      id: albumId, name, year, coverUrl: cover,
    }))[0];
  }

  async getAllSongsFromAlbum(id) {
    try {
      const result = await this._cacheService.get(`album-songs:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const detailAlbum = await this.getAlbumById(id);

      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE album_id=$1',
        values: [id],
      };

      const result = await this._pool.query(query);
      const mappedResult = {
        album: {
          ...detailAlbum,
          songs: [...result.rows],
        },
      };
      await this._cacheService.set(`album-songs:${id}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  async editAlbumById(id, { name, year, cover }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `
      UPDATE albums
      SET name = COALESCE($1, name),
          year = COALESCE($2, year),
          updated_at = $3,
          cover = COALESCE($4, cover)
      WHERE id = $5 RETURNING id
    `,
      values: [name, year, updatedAt, cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update. ID not found.');
    }
    await this._cacheService.delete(`album-songs:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete. ID not found.');
    }
    await this._cacheService.delete(`album-songs:${id}`);
  }
}

module.exports = AlbumsService;
