const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'export',
  version: '1.0.0',
  register: (server, { producerService, validator }) => {
    const exportHandler = new ExportHandler(producerService, validator);
    server.route(routes(exportHandler));
  },
};
