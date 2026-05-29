import fs from 'fs';
import path from 'path';

export function getModelFilesFromPath(dirPath: string): string[] {
  const files: string[] = [];

  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getModelFilesFromPath(fullPath)); // Recursively load subfolders
    } else if (/\.(ts|js)$/.test(file)) {
      files.push(fullPath);
    }
  });

  return files;
};


type FileModule = { default: any };

export async function loadModelsFromPath(dirPath: string): Promise<any[]> {
	const modelFiles = getModelFilesFromPath(dirPath);
	const models: any[] = [];

	for (const file of modelFiles) {
		try {
			const modelModule: FileModule = await import(file);
			if (modelModule.default) {
				models.push(modelModule.default);
			} else {
				console.warn(`No default export found in ${file}`);
			}
		} catch (error) {
			console.error(`Error loading model from ${file}:`, error);
		}
	}

	return models;
}