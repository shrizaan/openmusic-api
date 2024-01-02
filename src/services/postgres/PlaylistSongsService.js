const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
  }

  async addSongToPlaylist(playlistId, songId, credentialId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    // Check if song exists
    await this.checkSongExist(songId);
    // Check if playlist exists
    await this.checkSongInPlaylistExist(playlistId, songId);

    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add song to the playlist.');
    }

    // await this._cacheService.delete(`playlist-songs:${credentialId}`);
  }

  async getSongsFromPlaylist(playlistId, credentialId) {
    try {
      const result = await this._cacheService.get(`playlist-songs:${credentialId}`);
      return JSON.parse(result);
    } catch (error) {
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      const detailPlaylist = await this.getDetailPlaylist(playlistId);
      const playlistSongs = await this.getSongInPlaylist(playlistId);

      const mappedResult = {
        ...detailPlaylist.rows.map((r) => ({
          id: r.id,
          name: r.name,
          username: r.username,
        }))[0],
        songs: playlistSongs.rows.map((r) => ({
          id: r.id,
          title: r.title,
          performer: r.performer,
        })),
      };

      // await this._cacheService.set(`playlist-songs:${credentialId}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
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

    // await this._cacheService.delete(`playlist-songs:${credentialId}`);
  }

  async checkSongExist(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found.');
    }
  }

  async getDetailPlaylist(playlistId) {
    const query = {
      text: 'SELECT playlists.id AS id, playlists.name AS name, users.username AS username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist ID not found.');
    }

    return result;
  }

  async checkSongInPlaylistExist(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Song is already in the playlist');
    }
  }

  async getSongInPlaylist(playlistId) {
    const querySearchSong = {
      text: `SELECT songs.*
             FROM songs
                      JOIN playlist_songs ON songs.id = playlist_songs.song_id
                      JOIN playlists ON playlists.id = playlist_songs.playlist_id
                      WHERE playlist_id = $1 `,
      values: [playlistId],
    };

    const result = await this._pool.query(querySearchSong);

    if (!result.rows.length) {
      throw new NotFoundError('Tidak ada lagu di playlist');
    }

    return result;
  }
}

module.exports = PlaylistSongsService;
