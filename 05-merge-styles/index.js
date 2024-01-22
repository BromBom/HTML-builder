const path = require('path');
const { promises, createWriteStream } = require('fs');

async function createBundle(srcAddress, destAddress) {

  const bundleAddress = path.join(destAddress, '/bundle.css');
  const bundleStream = createWriteStream(bundleAddress);

  const styles = await promises.readdir(srcAddress);

  for (const file of styles) {
    const fileAddress = path.join(srcAddress, file);
    const statFile = await promises.stat(fileAddress);
    if (statFile.isFile() && path.extname(file) === '.css') {
      const arrBundle = [];
      const fd = await promises.open(fileAddress);
      const stream = fd.createReadStream({ encoding: 'utf8' });
      stream.on('data', (chunk) => arrBundle.push(chunk));
      stream.on('close', () => arrBundle.forEach((chunk) => bundleStream.write(chunk)));
    }
  }
}

try {
  const stylesAddress = path.join(__dirname, '/styles');
  const bundleAddress = path.join(__dirname, '/project-dist');
  createBundle(stylesAddress, bundleAddress);
} catch (err) {
  console.error(err.message);
}