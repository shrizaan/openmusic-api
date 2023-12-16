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

  async addSongToPlaylist(playlistId, songId) {
    await this.searchPlaylist(playlistId);
    await this.searchSong(songId);

    const id = `playlist_songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add song to the playlist.');
    }
  }

  async getSongsFromPlaylists(playlistId) {
    const playlist = await this.searchPlaylist(playlistId);

    const query = {
      text: `SELECT songs.*
             FROM songs
                      JOIN playlist_songs ON songs.id = playlist_songs.song_id
                      JOIN playlists ON playlists.id = playlist_songs.playlist_id
                      WHERE playlist_id = $1 `,
      values: [playlistId],
    };

    const result = this._pool.query(query);

    return {
      playlist: {
        ...playlist,
        songs: result.rows,
      },
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    await this.searchPlaylist(playlistId);
    await this.searchSong(songId);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete songs from playlist. Playlist ID or song ID not found.');
    }
  }

  async searchSong(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to add to playlist. Song ID not found.');
    }
  }

  async searchPlaylist(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to add to playlist. Playlist ID not found.');
    }

    return result.rows;
  }
}

module.exports = PlaylistsService;
