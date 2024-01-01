const Joi = require('joi');

const AlbumLikePayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { AlbumLikePayloadSchema };
