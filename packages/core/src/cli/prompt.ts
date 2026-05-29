import readline from 'node:readline';

export interface ConfirmPromptOptions {
  defaultValue?: boolean;
}

export interface InputPromptOptions {
  defaultValue?: string;
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export async function askInput(
  question: string,
  options: InputPromptOptions = {}
): Promise<string> {
  const rl = createInterface();
  const suffix = options.defaultValue
    ? ` (${options.defaultValue})`
    : '';

  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      rl.close();
      const resolved = answer.trim() || options.defaultValue || '';
      resolve(resolved);
    });
  });
}

export async function askConfirm(
  question: string,
  options: ConfirmPromptOptions = {}
): Promise<boolean> {
  const rl = createInterface();
  const defaultLabel =
    typeof options.defaultValue === 'boolean'
      ? options.defaultValue
        ? 'Y/n'
        : 'y/N'
      : 'y/N';

  return new Promise((resolve) => {
    rl.question(`${question} (${defaultLabel}): `, (answer) => {
      rl.close();

      const value = answer.trim().toLowerCase();

      if (!value && typeof options.defaultValue === 'boolean') {
        resolve(options.defaultValue);
        return;
      }

      resolve(value === 'y' || value === 'yes');
    });
  });
}

export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/g, '-').toLowerCase();
}