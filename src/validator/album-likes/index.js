const { AlbumLikePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumLikesValidator = {
  validateAlbumLikePayload: (paylaod) => {
    const validationResult = AlbumLikePayloadSchema.validate(paylaod);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumLikesValidator;
