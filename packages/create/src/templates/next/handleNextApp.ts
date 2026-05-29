import fs from 'fs-extra';
import path from 'path';
import { colorize } from '../../utils/colorize';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';

/**
 * Handles the creation of a Next.js application with optional Tenra integration.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 */
export async function handleNextApp(projectName: string, options: TemplateOptions) {
  const { useTypeScript, useTenra, includeLogger } = options;
  const ext = useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);

  console.log(colorize(`\n Creating Next.js app in ${rootDir}...\n`, 'cyan'));

  // 1. Create Next.js app
  const createCommand = `npx create-next-app@latest ${projectName} ${useTypeScript ? '--typescript' : ''} --no-tailwind --eslint`;
  execSync(createCommand, { stdio: 'inherit' });

  const pagesDir = path.join(rootDir, 'pages');
  const apiDir = path.join(pagesDir, 'api');
  const configDir = path.join(rootDir, 'lib');

  fs.ensureDirSync(apiDir);
  fs.ensureDirSync(configDir);

  // 2. API Route Example with Tenra Core if enabled
  const apiHandler = useTypeScript
    ? `import type { NextApiRequest, NextApiResponse } from 'next';
${useTenra ? `import { initTenra } from '@tenra/core';` : ''}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  ${useTenra ? 'conat Tenra = await initTenra(); \n const graphql = Tenra.getGraphQL();' : ''}
  res.status(200).json({ message: 'Hello from API route!' });
}
`
    : `${useTenra ? `const { initTenra } = require('@tenra/core');\n` : ''}
export default async function handler(req, res) {
  ${useTenra ? 'conat Tenra = await initTenra(); \n const graphql = Tenra.getGraphQL();;' : ''}
  res.status(200).json({ message: 'Hello from API route!' });
}
`;

  fs.writeFileSync(path.join(apiDir, `hello.${ext}`), apiHandler);

  // 3. Create .env file
  fs.writeFileSync(
    path.join(rootDir, '.env.local'),
    `MONGO_URI=mongodb://localhost:27017/${projectName}`
  );

  // 4. Create Tenra config
  if (useTenra) {
    const TenraConfig = useTypeScript
      ? `import { TenraClient } from '@tenra/core';

      const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}';

const client = new TenraClient(uri, options);

export async function createConnection() {
  // You can use a try-catch block to handle connection errors
  try {
  await client.connect();
  return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
`
      : `const { TenraClient } = require('@tenra/core');

const client = new TenraClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});

async function createConnection() {
  // You can use a try-catch block to handle connection errors
  await client.connect();
  return client;
}

module.exports = { createConnection };
`;

    fs.writeFileSync(path.join(configDir, `tenra.config.${ext}`), TenraConfig);
  }


  // 5. Optional utils
  if (includeLogger) {
    const utilsDir = path.join(rootDir, 'lib', 'utils');
    fs.ensureDirSync(utilsDir);

    const utilCode = useTypeScript
      ? `export function respondSuccess(data: any) {
  return { success: true, data };
}`
      : `function respondSuccess(data) {
  return { success: true, data };
}
module.exports = { respondSuccess };`;

    fs.writeFileSync(path.join(utilsDir, `helper.${ext}`), utilCode);
  }

  // 6. Install Tenra Core
  if (useTenra) {
    console.log(colorize('Installing @tenra/core...', 'yellow'));
    execSync(`npm install @tenra/core`, { cwd: rootDir, stdio: 'inherit' });
  }
  if(includeLogger && !useTenra) {
    console.log(colorize('Installing @tenra/logger...', 'yellow'));
    execSync(`npm install @tenra/logger`, { cwd: rootDir, stdio: 'inherit' });
  }
  // 7. Final message
  if(useTenra) {
    console.log(colorize('Tenra Core installed successfully!', 'green'));
  }
  if(includeLogger && !useTenra) {
    console.log(colorize('Tenra Logger installed successfully!', 'green'));
  }

  console.log(colorize('\nNext.js app setup complete!\n', 'green'));
};