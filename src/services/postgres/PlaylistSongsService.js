const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
  }

  async addSongToPlaylist(playlistId, songId, credentialId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // Check if song exists
    const queryCheckSong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultCheckSong = await this._pool.query(queryCheckSong);

    if (!resultCheckSong.rows.length) {
      throw new NotFoundError('Song not found.');
    }

    // Check if song is already in the playlist
    const queryCheckPlaylistSong = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const resultCheckPlaylistSong = await this._pool.query(queryCheckPlaylistSong);

    if (resultCheckPlaylistSong.rows.length) {
      throw new InvariantError('Song is already in the playlist');
    }

    const id = `playlist_songs-${nanoid(16)}`;

    const queryInsertSong = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const resultInsertSong = await this._pool.query(queryInsertSong);
    console.trace('masuk ke post database', resultInsertSong.rows);

    if (!resultInsertSong.rows.length) {
      throw new InvariantError('Failed to add song to the playlist.');
    }
  }

  async getSongsFromPlaylist(playlistId, credentialId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const querySearchPlaylist = {
      text: 'SELECT playlists.id AS id, playlists.name AS name, users.username AS username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const playlistQueryResult = await this._pool.query(querySearchPlaylist);
    console.trace(playlistQueryResult.rows);

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

    const songQueryResult = await this._pool.query(querySearchSong);

    return {
      ...playlistQueryResult.rows.map((r) => ({
        id: r.id,
        name: r.name,
        username: r.username,
      }))[0],
      songs: songQueryResult.rows.map((r) => ({
        id: r.id,
        title: r.title,
        performer: r.performer,
      })),
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, credentialId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

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
