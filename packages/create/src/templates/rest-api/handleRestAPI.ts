import path from 'path';
import fs from 'fs-extra';
import { colorize } from '../../utils/colorize';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';


/**
 * @function handleRestAPI
 * Handles the creation of a REST API project using Tenra.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 * @returns {Promise<void>} - A promise that resolves when the project is created.
 *
 * @example
 * handleRestAPI('my-rest-api', { useTypeScript: true, useTenra: true, includeUtils: false });
 *  
 */
export async function handleRestAPI(
  projectName: string,
  options: TemplateOptions
) {
  const ext = options.useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const srcDir = path.join(rootDir, 'src');
  const README_FILE = path.join(rootDir, 'README.md');

  console.log(colorize(`\n Creating REST API project in ${rootDir}...\n`, 'cyan'));
  fs.ensureDirSync(srcDir);

  // Step 1: Write entry file
  const entryFileContent = `
import express from 'express';
import cors from 'cors';
${options.useTenra ? `import { TenraClient } from '@tenra/core';` : ''}
${options.includeLogger ? `import { Logger } from '@tenra/logger'; // Example usage` : ''}


const app = express();
app.use(cors());
app.use(express.json());

${options.useTenra ? `
const client = new TenraClient(process.env.MONGO_URI);
await client.connect();
` : ''}

// Initialize logger properly. You have two options: Move the imported class above
// to a dedicated file and implement it to take full advantage it's features or
// import a direct logger instance like below:
// import { logger } from '@tenra/logger'; and start using it logger.log(). This
// takes three parameters: the log level, the message, and an optional context object.
${options.includeLogger ? `// await abLogger.log('Started', 'info', { tenantId: 'tenant-a' });` : ''}
${options.includeLogger ? `const logger = Logger.initialise('Implementation here.'); \n logger.info('Hello Tenra!.')` : ''}

app.get('/', (_, res) => {
  res.send('Tenra for REST APIs...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), entryFileContent.trimStart());

  // Step 2: Write .env
  fs.writeFileSync(path.join(rootDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`);




  // Step 3: Init & install dependencies
  execSync(`npm init -y`, { cwd: rootDir, stdio: 'inherit' });

  execSync(
    `npm install express@5.1.0 cors dotenv@16.4.7 ${options.useTenra ?
      '@Tenra/core' : ''}${options.includeLogger ? ' @tenra/logger' : ''}`,
    { cwd: rootDir, stdio: 'inherit' }
  );

  // Add README file
  const readmeContent = `
# ${projectName}
This project was scaffolded using the Tenra CLI.
## Getting Started
1. npm install  
2. npm run dev
3. Read the Tenra Core documentation to understand how to use them (tenra.docs)['https://nodem9.github.io/Tenra/'].
4. Ensure you send an x-tenant-id header with every request if using multi-tenancy. (This is optional)
5. Customize your REST API as needed.

## Environment Variables  

Create a .env file in the root directory with the following variables:

\`\`\`

MONGO_URI=mongodb://localhost:27017/${projectName}
PORT=5000

\`\`\`

## License
This project is licensed under the MIT License - see the LICENSE file for details.
`;
  fs.writeFileSync(README_FILE, readmeContent.trimStart());

  if (options.useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/express @types/node`, { cwd: srcDir, stdio: 'inherit' });


    fs.writeFileSync(path.join(srcDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        "target": "es5",
        "lib": [
          "dom",
          "dom.iterable",
          "esnext"
        ],
        "module": "esnext",
        "moduleResolution": "node",
        "rootDir": "src",
        // "outDir": '',
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true,
        "noEmit": true
      }
    }, null, 2));
  }

  console.log(colorize('\n✔ REST API project setup complete!', 'green'));
  console.log(colorize(`✔ REST API project "${projectName}" created successfully.`, 'green'));
  console.log('=====', 'Packages installed:', '=====');
  console.log(colorize(`- Tenra Core (if selected)`, 'lightBlue'));
  console.log(colorize(`- Tenra Logger (if selected)`, 'lightBlue'));
  console.log(colorize(`- express`, 'lightBlue'));
  console.log(colorize(`- cors`, 'lightBlue'));
  console.log('\nNext Steps:');
  console.log(colorize(`- cd ${projectName}`, 'lightBlue'));
  console.log(colorize(`- npm run dev`, 'lightBlue'));
  console.log(colorize(`- Customize your Tenra powered REST API from there.`, 'lightBlue'));
};



