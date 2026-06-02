import inquirer from 'inquirer';


export async function promptProjectOptions() {
  const answers = await inquirer.prompt([
    {
      name: 'projectType',
      type: 'list',
      message: 'Select a project template:',
      choices: ['MERN Stack', 'Next.js App', 'REST API', 'GraphQL API']
    },
    {
      name: 'projectName',
      type: 'input',
      message: 'Enter your project name:',
      validate: input => !!input || 'Project name is required.'
    },
    {
      name: 'language',
      type: 'list',
      message: 'Select a language for your project:',
      choices: ['TypeScript', 'JavaScript'],
      default: 'TypeScript'
    },
    {
      name: 'useAmbiten',
      type: 'confirm',
      message: 'Do you want to use(@ambiten/core)? / This package uses npm by default, if your package is different you may want to choose "NO" and install it manually later.',
      default: true
    },
    {
      name: 'includeLogger',
      type: 'confirm',
      message: 'Include (@ambiten/logger)? / This package uses npm by default, if your package is different you may want to choose "NO" and install it manually later.',
      default: true
    }
  ]);

  return {
    ...answers,
    useTypeScript: answers.language === 'TypeScript'
  };
}

