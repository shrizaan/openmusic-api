const mapDBAlbumToModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBSongToModel = ({
  // eslint-disable-next-line camelcase
  id, title, year, performer, genre, duration, album_id,
}) => ({
  // eslint-disable-next-line camelcase
  id, title, year, performer, genre, duration, albumId: album_id,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBSongToModel,
};
