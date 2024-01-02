const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
  }

  async addPlaylistActivity({
    playlistId, songId, userId, action, time,
  }) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const id = `playlist-activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw InvariantError('Failed to add playlist activity.');
    }

    await this._cacheService.delete(`playlists-activities:${userId}-${playlistId}`);

    return result.rows[0].id;
  }

  async getPlaylistActivities(playlistId, userId) {
    try {
      const result = await this._cacheService.get(`playlists-activities:${userId}-${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      const querySearchPlaylist = {
        text: 'SELECT * FROM playlists WHERE id = $1',
        values: [playlistId],
      };

      const resultSearchPlaylist = await this._pool.query(querySearchPlaylist);

      if (!resultSearchPlaylist.rows.length) {
        throw new NotFoundError('Playlist ID not found.');
      }

      const query = {
        text: `SELECT users.username, songs.title, action, time
               FROM playlist_song_activities
                        JOIN playlists ON playlist_song_activities.playlist_id = playlists.id
                        JOIN songs ON playlist_song_activities.song_id = songs.id
                        JOIN users on users.id = playlists.owner
               WHERE playlist_song_activities.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new InvariantError('Playlist ID not found.');
      }

      await this._cacheService.set(`playlists-activities:${userId}-${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }
}

module.exports = PlaylistActivitiesService;
