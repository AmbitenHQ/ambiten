// src/cli/commands/handlers/handleMERNStack.ts
import fs from 'fs-extra';
import path from 'path';
import { colorize } from '../../utils/colorize';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';

/**
 * Handles the creation of a MERN stack project with optional TypeScript and Tenra Core integration.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 */
export async function handleMERNStack(projectName: string, options: TemplateOptions) {
  const { useTypeScript, useTenra, includeLogger } = options;
  const ext = useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const clientDir = path.join(rootDir, 'client');
  const serverDir = path.join(rootDir, 'server');

  // 1. Create base directories
  fs.ensureDirSync(clientDir);
  fs.ensureDirSync(serverDir);

  // 2. Setup React frontend
  console.log(colorize(' Setting up React frontend...', 'yellow'));
  const reactTemplate = useTypeScript ? '--template typescript' : '';
  execSync(`npx create-react-app ${clientDir} ${reactTemplate}`, { stdio: 'inherit' });

  // 3. Setup Express backend
  console.log(colorize('Setting up Express backend...', 'yellow'));

  const expressIndex = `import express from 'express';

import { config } from 'dotenv';
${useTenra ? `import { TenraClient } from '@tenra/core';` : ''}

config();
const app = express();
app.use(express.json() as express.Express);

${useTenra ? `const client = new TenraClient({ uri: process.env.MONGO_URI });\nawait client.connect();\n` : ''}

app.get('/', (_, res) => {
  res.send('Hello Tenra user..');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

  fs.writeFileSync(path.join(serverDir, `index.${ext}`), expressIndex);

  // 4. Tenra Core configuration file
  if (useTenra) {
    const TenraConfig = useTypeScript
      ? `import { TenraClient } from '@tenra/core';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}';

export const client = new TenraClient(uri, options);

export async function createConnection() {
  await client.connect();
}
`
      : `const { TenraClient } = require('@tenra/core');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}';

const client = new TenraClient(uri, options);

async function createConnectiono() {
  await client.connect();
}

module.exports = { createConnection };
`;

    fs.writeFileSync(path.join(serverDir, `tenra.config.${ext}`), TenraConfig);
  }

  // 5. Environment variables
  fs.writeFileSync(
    path.join(serverDir, '.env'),
    `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`
  );


  // 6. Backend package.json and dependencies
  execSync(`npm init -y`, { cwd: serverDir, stdio: 'inherit' });

  execSync(`npm install express cors dotenv${useTenra ? ' @tenra/core' : ''}`, {
    cwd: serverDir,
    stdio: 'inherit'
  });

  if (useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/node @types/express`, {
      cwd: serverDir,
      stdio: 'inherit'
    });

    fs.writeFileSync(
      path.join(serverDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            "target": "ES2020",
            "lib": [
              "dom",
              "dom.iterable",
              "esnext"
            ],
            "module": "commonjs",
            "rootDir": "./",
            "outDir": "./dist",
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "strict": true,
            "skipLibCheck": true,
            "resolveJsonModule": true,
            "noEmit": true
          }
        },
        null,
        2
      )
    );
  }

  // 7. Optional utils file
  if (includeLogger) {
    const utilsDir = path.join(serverDir, 'utils');
    fs.ensureDirSync(utilsDir);

    const utilCode =
      ext === 'ts'
        ? `export function formatResponse(data: any) {
  return { success: true, data };
}`
        : `function formatResponse(data) {
  return { success: true, data };
}
module.exports = { formatResponse };`;

    fs.writeFileSync(path.join(utilsDir, `helper.${ext}`), utilCode);
  }

  // 8. Final message
  console.log(colorize('\nMERN Stack project setup complete!\n', 'green'));
}
