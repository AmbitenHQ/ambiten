import fs from 'fs';
import path from 'path';
import { handleMERNStack } from '../templates/mern/handleMERNStack';
import { handleNextApp } from '../templates/next/handleNextApp';
import { handleGraphQLAPI } from '../templates/graphql-api/handleGraphQLAPI';
import { handleRestAPI } from '../templates/rest-api/handleRestAPI';
import { ProjectChoices } from '../utils/types';
import { colorize } from '../utils/colorize';

/**
 * Generates a new project based on the provided choices.
 *
 * @param {ProjectChoices} choices - The user's choices for project generation.
 * @returns {Promise<void>} A promise that resolves when the project is generated.
 */
export async function generateProject(choices: ProjectChoices) {
  const { projectType, projectName, useTenra, useTypeScript, includeLogger } = choices;
  const projectRoot = path.resolve(process.cwd(), projectName);

  // Check if the project folder already exists
  if (fs.existsSync(projectRoot)) {
    console.log(colorize(`❌ Folder ${projectName} already exists.`, 'red'));
    return;
  }

  // Create the project folder
  fs.mkdirSync(projectRoot, { recursive: true });
  writeDefaultTenraConfig(projectRoot);
  console.log(colorize(`Creating ${projectType} project: ${projectName}`, 'blue'));

  // Handle project generation based on the project type
  switch (projectType) {
    case 'MERN Stack':
      return await handleMERNStack(projectName, { useTypeScript, useTenra, includeLogger });;
    case 'Next.js App':
      return await handleNextApp(projectName, { useTypeScript, useTenra, includeLogger });
    case 'REST API':
      return await handleRestAPI(projectName, { useTypeScript, useTenra, includeLogger });
    case 'GraphQL API':
      return await handleGraphQLAPI(projectName, { useTypeScript, useTenra, includeLogger });
    default:
      console.log(colorize(`Unknown or Invalid project type: ${projectType}`, 'red'));
  }
  // Log success message
  console.log(colorize(` ${projectType} project "${projectName}" created successfully.`, 'green'));
};



function writeDefaultTenraConfig(projectPath: string) {
  const configPath = path.join(projectPath, 'tenra.config.json');

  const defaultJson = {
    /**If you prefer to get a config with more features, you can delete this file initialise Tenra vie commandline  */
    /**Note: Bootstraping Tenra via commandline is Advanced. Read more: 'https://nodem9.github.io/Tenra/core/Tenra-bootstrap/TenraBootstrap' */
    projectName: "my-tenra-app",
    database: {
      uri: "mongodb://localhost:27017/mydatabase",
      options: {}
    },
    features: {
      logger: true,
      graphql: false,
      multiTenant: false,
      enableRedis: false
    },
    logger: {
      level: "info",
      transports: [
        {
          type: "file",
          path: "./logs/app.log"
        }
      ]
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultJson, null, 2), 'utf-8');
}

