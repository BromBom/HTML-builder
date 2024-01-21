const path = require('path');
const { readdir, stat } = require('fs/promises');

async function showDirContent(address) {
  const files = await readdir(address);
  for (const file of files) {
    const statFile = await stat(path.join(address, file));
    if (statFile.isFile()) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const size = (statFile.size / 1024).toFixed(3);
      const result = `${name} - ${ext.slice(1)} - ${size}kb`;
      console.log(result);
    }
  }
}

try {
  const address = path.join(__dirname, '/secret-folder');
  showDirContent(address);
} catch (err) {
  console.error(err.message);
}