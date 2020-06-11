import sharp from 'sharp';
import glob from 'glob';
import path from 'path';

const supportedExtensions = [
  'jpeg', 'jpg', 'png', 'webp', 'tif', 'tiff',
];
const maxWidth = 800;

const parseSnippets = async contentDirPath => {
  // Load configurations
  let configs = [];
  glob.sync(`${contentDirPath}/configs/*.json`)
    .forEach( file => {
      configs.push(
        require( path.resolve( file ) )
      );
    });

  const assets = configs.reduce((acc, cfg) => {
    if (cfg.images && cfg.images.name && cfg.images.path) {
      glob.sync(`${contentDirPath}/sources/${cfg.dirName}/${cfg.images.path}/*.@(${supportedExtensions.join('|')})`)
        .forEach( file => {
          acc.push(path.resolve( file ));
        });
    }
    return acc;
  }, []);

  await Promise.all(assets.map(asset => new Promise((resolve, reject) => {
    const fileName = asset.slice(asset.lastIndexOf('/'));
    const img = sharp(asset);
    return img
      .metadata()
      .then(metadata => {
        const resizeWidth = Math.min(maxWidth, metadata.width);
        const format = metadata.format;
        return img
          .resize({ width: resizeWidth })
          .toFormat(format, {quality: 80})
          .toFile(
            `${contentDirPath}/assets/${fileName}`,
            (err, info) => {
              if (err)
                reject(err);
              else
                resolve(info);

            }
          );
      });
  })));
};

export default parseSnippets;
