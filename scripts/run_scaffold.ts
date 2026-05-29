/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const generator = require('../packages/core/src/templates/scaffold/structureGenerator');

(async () => {
	try {
		const out = path.resolve('C:/Users/User/OneDrive/Desktop/tenra-scaffold-test');
		await generator.generateAppStructure(out, { projectName: 'tenra-scaffold-test', graphql: { enabled: true }, advanced: { autoInstall: false } });
		console.log('Scaffold generated at', out);
	} catch (err) {
		console.error('Scaffold failed', err);
		process.exit(1);
	}
})();
