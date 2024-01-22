const path = require('path');
const { mkdir, unlink, stat, readdir, copyFile } = require('fs/promises');

async function deleteFiles(address) {
  const content = await readdir(address, { withFileTypes: true });
  for (const item of content) {
    if (item.isFile()) {
      await unlink(path.join(address, item.name));
    } else if (item.isDirectory()) {
      deleteFiles(path.join(address, item.name));
    }
  }
}

async function copyDir(srcAddress, distAddress) {
  await mkdir(distAddress, { recursive: true });
  const content = await readdir(srcAddress, { withFileTypes: true });
  for (const item of content) {
    if (item.isFile()) {
      await copyFile(path.join(srcAddress, item.name), path.join(distAddress, item.name));
    } else if (item.isDirectory()) {
      copyDir(path.join(srcAddress, item.name), path.join(distAddress, item.name));
    }
  }
}

async function updateDir(srcAddress, distAddress) {
  const statDir = await stat(distAddress).catch(() => null);
  if (statDir) await deleteFiles(distAddress).catch((err) => console.error('deleteFiles:', err.message));
  await copyDir(srcAddress, distAddress).catch((err) => console.error('copyDir:', err.message));
}

try {
  const filesDirAddress = path.join(__dirname, '/files');
  const copyDirAddress = path.join(__dirname, '/files-copy');
  updateDir(filesDirAddress, copyDirAddress).catch((err) => console.error('updateDir:', err.message));
} catch (err) {
  console.error(err.message);
}