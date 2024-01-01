exports.up = (pgm) => {
  pgm.createTable('album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('album_likes', 'unique_user_id_album_id', 'UNIQUE(user_id, album_id)');

  pgm.addConstraint('album_likes', 'fk_album_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id)');
  pgm.addConstraint('album_likes', 'fk_album_likes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id)');
};

exports.down = (pgm) => {
  pgm.dropTable('album_likes');
};
