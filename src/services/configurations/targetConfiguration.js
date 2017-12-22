const { provider } = require('jimple');
const ConfigurationFile = require('../../interfaces/configurationFile');

class TargetConfiguration extends ConfigurationFile {
  constructor(overwritePath, baseConfiguration, pathUtils) {
    super(pathUtils, overwritePath, true, baseConfiguration);
  }

  createConfig() {
    return {};
  }
}

const targetConfiguration = provider((app) => {
  app.set('targetConfiguration', () => (
    overwritePath,
    baseConfiguration
  ) => new TargetConfiguration(
    overwritePath,
    baseConfiguration,
    app.get('pathUtils')
  ));
});

module.exports = {
  TargetConfiguration,
  targetConfiguration,
};
