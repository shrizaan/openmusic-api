class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }
  
  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistsPayload(request.payload);
    
    const { name, owner } = request.payload;
    
    
    const id = await this._service.addPlaylist({name, owner});
    
    
    
  }
}

module.exports = PlaylistsHandler;
