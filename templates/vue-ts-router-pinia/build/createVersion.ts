import fs from 'fs-extra';
import { resolve } from 'path';

function pathResolve(dir: string) {
  return resolve(process.cwd(), './dist', dir);
}

fs.writeJsonSync(pathResolve('version.json'), { timestamp: Date.now() });
