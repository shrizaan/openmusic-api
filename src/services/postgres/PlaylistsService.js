const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

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
    // const query = {
    //   text: `SELECT playlists.*
    //          FROM playlists
    //                   LEFT JOIN collaborations ON collaborations.id = playlists.id
    //          WHERE playlists.owner = $1
    //             OR collaborations.user_id = $1
    //          GROUP BY playlists.id`,
    //   values: [owner],
    // };

    const query = {
      text: 'SELECT playlists.id AS id, playlists.name AS name, users.username AS username FROM playlists JOIN users ON users.id = playlists.owner WHERE users.id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      username: r.username,
    }));
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist failed to delete. ID not found.');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found.');
    }

    const playlist = result.rows[0];
    console.log(owner);

    if (playlist.owner !== owner) {
      console.trace(playlist.owner !== owner);
      throw new AuthorizationError('You are not authorized to access this resource.');
    }
  }

  async verifyPlaylistAccess(playlistId, owner) {
    try {
      await this.verifyPlaylistOwner(playlistId, owner);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw error;
      // TODO: Belum menambahkan verifyCollaborator di CollaborationsService
    }
  }
}

module.exports = PlaylistsService;
