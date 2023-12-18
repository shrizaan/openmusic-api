const { Pool } = require('pg');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }
}
