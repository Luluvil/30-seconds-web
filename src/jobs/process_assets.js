const paths = require('config/paths');
import parseImages from 'build/parsers/parseImages';

/**
 * Read content configs, generating the assets.
 */
parseImages(paths.contentPath);
