const path = require('path');
const { promises, createWriteStream } = require('fs');

async function createDistDir(distAddress) {
  await promises.mkdir(distAddress, { recursive: true });
}

async function createPageLayout(srcTemplAddress, srcCompAddress, distAddress) {
  let template = await promises.readFile(srcTemplAddress, { encoding: 'utf8' });
  const compFiles = await promises.readdir(srcCompAddress, { withFileTypes: true });

  for (let item of compFiles) {
    if (item.isFile()) {
      const compContent = await promises.readFile(path.join(srcCompAddress, item.name), { encoding: 'utf8' });
      const compTag = `{{${path.basename(item.name, path.extname(item.name))}}}`;

      template = template.replace(compTag, compContent);
    }
  }
  const resultAddress = path.join(distAddress, '/index.html');
  const resultStream = createWriteStream(resultAddress);

  resultStream.write(template);
}

async function createBundleStyles(srcAddress, distAddress) {
  const bundleAddress = path.join(distAddress, '/style.css');
  const bundleStream = createWriteStream(bundleAddress);
  const styleFiles = await promises.readdir(srcAddress, { withFileTypes: true });

  styleFiles.sort((a) => (a.name === 'header.css') ? -1 : 0);
  for (let file of styleFiles) {
    const fileAddress = path.join(srcAddress, file.name);

    if (file.isFile() && path.extname(file.name) === '.css') {
      const arrBundle = [];
      const fd = await promises.open(fileAddress);
      const stream = fd.createReadStream({ encoding: 'utf8' });

      stream.on('data', (chunk) => arrBundle.push(chunk));
      stream.on('close', () => arrBundle.forEach((chunk) => bundleStream.write(chunk)));
    }
  }
}

async function deleteFiles(address) {
  const content = await promises.readdir(address, { withFileTypes: true });
  
  for (const item of content) {
    if (item.isFile()) {
      await promises.unlink(path.join(address, item.name));
    } else if (item.isDirectory()) {
      deleteFiles(path.join(address, item.name));
    }
  }
}

async function copyDir(srcAddress, distAddress) {
  await promises.mkdir(distAddress, { recursive: true });
  const content = await promises.readdir(srcAddress, { withFileTypes: true });

  for (const item of content) {
    if (item.isFile()) {
      await promises.copyFile(path.join(srcAddress, item.name), path.join(distAddress, item.name));
    } else if (item.isDirectory()) {
      copyDir(path.join(srcAddress, item.name), path.join(distAddress, item.name));
    }
  }
}

async function updateAssets(srcAddress, distAddress) {
  const statDir = await promises.stat(distAddress).catch(() => null);

  if (statDir) await deleteFiles(distAddress).catch((err) => console.error('deleteFiles:', err.message));
  await copyDir(srcAddress, distAddress).catch((err) => console.error('copyDir:', err.message));
}

try {
  const projectAddress = path.join(__dirname, '/project-dist');
  const templAddress = path.join(__dirname, 'template.html');
  const compAddress = path.join(__dirname, '/components');
  const stylesAddress = path.join(__dirname, '/styles');
  const assetsAddress = path.join(__dirname, '/assets');

  createDistDir(projectAddress).catch((err) => console.error('createDistDir:', err.message));
  createPageLayout(templAddress, compAddress, projectAddress).catch((err) => console.error('createPageLayout:', err.message));
  createBundleStyles(stylesAddress, projectAddress).catch((err) => console.error('createBundleStyles:', err.message));
  updateAssets(assetsAddress, path.join(projectAddress, '/assets')).catch((err) => console.error('updateAssets:', err.message));

} catch (err) {
  console.error(err.message);
}