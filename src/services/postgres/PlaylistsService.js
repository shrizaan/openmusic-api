const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add playlist');
    }

    return result.rows[0].id;
  }

  // TODO: Sepertinya masih salah
  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.*
             FROM playlists
                      LEFT JOIN collaborations ON collaborations.id = playlists.id
             WHERE playlists.id = $1
                OR collaborations.user_id = $1
             GROUP BY playlists.id`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(owner, playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE owner = $1 AND id = $2 RETURNING id',
      values: [owner, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist failed to delete. ID not found.');
    }
  }
}

module.exports = PlaylistsService;
