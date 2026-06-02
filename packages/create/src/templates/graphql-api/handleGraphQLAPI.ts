import path from 'path';
import fs from 'fs-extra';
import { colorize } from '../../utils/colorize';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';


/**
 * Handles the creation of a GraphQL API project.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 * @returns {Promise<void>} A promise that resolves when the project is created.
 */
export async function handleGraphQLAPI(
  projectName: string,
  options: TemplateOptions
) {
  const ext = options.useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const srcDir = path.join(rootDir, 'src');

  console.log(colorize(`\nCreating GraphQL API project in ${rootDir}...\n`, 'cyan'));
  fs.ensureDirSync(srcDir);

  // Step 1: Write entry file
  const entryFileContent = `
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import cors from 'cors';
${options.useAmbiten ? `import { AmbitenGraphQL } from '@ambiten/core';` : ''}
${options.includeLogger ? `import { setupLogger, Logger } from '@ambiten/create';` : ''}

const app = express();
app.use(cors());
app.use(express.json());

${options.useAmbiten ? `
const schema = new AmbitenGraphQL();

app.use('/graphql', graphqlHTTP({ schema.generateSchema(), graphiql: true }));
` : `
app.use('/graphql', graphqlHTTP({ schema: /* your schema here */, graphiql: true }));
`}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`GraphQL server running on port \${PORT}\`));
`;


  //Ambiten config file
  const { useAmbiten, useTypeScript, includeLogger } = options;
  if (useAmbiten) {
    const configDir = path.join(rootDir, 'config');
    fs.ensureDirSync(configDir);
    const AmbitenConfig = useTypeScript
      ? `import { AmbitenClientOptions, AmbitenClient } from '@ambiten/core';
export const options: AmbitenClientOptions = {
  // Add your Ambiten client options here
};
export const client = new AmbitenClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});
export async function createConnection() {
  // You can use a try-catch block to handle connection errors
  await client.connect();
  return client;
}
`
      : `const { AmbitenClient } = require('@ambiten/core');  
const options = {
  // Add your Ambiten client options here
};
const client = new AmbitenClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});
async function createConnection() {
  // You can use a try-catch block to handle connection errors
  await client.connect();
  return client;
}
module.exports = { createConnection };
`;
    fs.writeFileSync(path.join(configDir, `Ambiten.config.${ext}`), AmbitenConfig);
  }

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), entryFileContent.trimStart());

  // Step 2: .env
  fs.writeFileSync(path.join(rootDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`);

  // Step 3: Init & install dependencies
  execSync(`npm init -y`, { cwd: rootDir, stdio: 'inherit' });

  const coreDeps = `dotenv@16.4.7 express-graphql graphql${options.useAmbiten ?
    ' @ambiten/core' : ''}${options.includeLogger ? ' @ambiten/create' : ''}`;
  execSync(`npm install ${coreDeps}`, { cwd: rootDir, stdio: 'inherit' });
  console.log(colorize('\n Installing dependencies...', 'green'));

  if (options.useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/express @types/node @types/express-graphql`, {
      cwd: rootDir,
      stdio: 'inherit'
    });

    fs.writeFileSync(path.join(rootDir, 'tsconfig.json'), JSON.stringify({
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
    }, null, 2));
  };


  console.log(colorize('\nGraphQL API project setup complete!', 'green'));
};


