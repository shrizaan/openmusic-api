const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
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

  async getSongsFromPlaylist(playlistId) {
    const querySearchPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const playlistQueryResult = await this._pool.query(querySearchPlaylist);

    if (!playlistQueryResult.rows.length) {
      throw new NotFoundError('Playlist ID not found.');
    }

    const querySearchSong = {
      text: `SELECT songs.*
             FROM songs
                      JOIN playlist_songs ON songs.id = playlist_songs.song_id
                      JOIN playlists ON playlists.id = playlist_songs.playlist_id
                      WHERE playlist_id = $1 `,
      values: [playlistId],
    };

    const songQueryResult = this._pool.query(querySearchSong);

    return {
      playlist: {
        ...playlistQueryResult,
        songs: songQueryResult.rows,
      },
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete songs from playlist. Playlist ID or song ID not found.');
    }
  }
}

module.exports = PlaylistSongsService;
