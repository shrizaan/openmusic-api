const { SongPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const songsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = songsValidator;
