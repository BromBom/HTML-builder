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

async function copyDir(srcAddress, destAddress) {
  await mkdir(destAddress, { recursive: true });
  const content = await readdir(srcAddress, { withFileTypes: true });
  for (const item of content) {
    if (item.isFile()) {
      await copyFile(path.join(srcAddress, item.name), path.join(destAddress, item.name));
    } else if (item.isDirectory()) {
      copyDir(path.join(srcAddress, item.name), path.join(destAddress, item.name));
    }
  }
}

async function updateDir(srcAddress, destAddress) {
  const statDir = await stat(destAddress).catch(() => null);
  if (statDir) await deleteFiles(destAddress).catch((err) => console.error('deleteFiles:', err.message));
  await copyDir(srcAddress, destAddress).catch((err) => console.error('copyDir:', err.message));
}

try {
  const filesDirAddress = path.join(__dirname, '/files');
  const copyDirAddress = path.join(__dirname, '/files-copy');
  updateDir(filesDirAddress, copyDirAddress).catch((err) => console.error('updateDir:', err.message));
} catch (err) {
  console.error(err.message);
}