/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
/*
 Copies packages/core/CHANGELOG.md (or packages/core/CHANGELOG) into
docs/website/docs/core/logChanges.md so Docusaurus can include it.

 Usage: node ./scripts/copy-changelog.js
*/
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const coreChangelog = path.join(repoRoot, 'packages', 'core', 'CHANGELOG.md');
const coreChangelogAlt = path.join(repoRoot, 'packages', 'core', 'CHANGELOG');
const dest = path.join(repoRoot, 'docs', 'website', 'docs', 'core', 'logChanges.md');

function findSource() {
	if (fs.existsSync(coreChangelog)) return coreChangelog;
	if (fs.existsSync(coreChangelogAlt)) return coreChangelogAlt;
	return null;
}

function main() {
	const src = findSource();

	// Simple frontmatter to make the page render nicely in Docusaurus
	const header = `---\nslug: /core/log-changes\ntitle: Core changelog\n---\n\n`;

	if (!src) {
		// No changelog found: write a friendly placeholder that explains
		// releases haven't been published yet and points to the new scoped
		// packages and release plan.
		const placeholder = header + [
			`# No releases published yet`,
			``,
			`We haven't published any releases for the new scoped @TENRA packages yet.`,
			`This repository is being re-scoped and the first public releases will start at version 1.0.0.`,
			``,
			`What this means for the docs:`,
			`- There are currently no changelogs to display for published packages.`,
			`- When packages are released, the changelog generator will populate this page automatically.`,
			``,
			`Planned next steps:`,
			`- Publish scoped packages under the @TENRA scope starting at v1.0.0.`,
			`- Run the changelog generator (e.g. changesets/auto-changelog) and then this script to populate the changelog page.`,
			``,
			`If you maintain a local changelog file in \`packages/core/CHANGELOG.md\`, run the changelog generator or create that file and then run:`,
			``,
			'```',
			'node ./scripts/copy-changelog.js',
			'```',
			``,
			`For release tracking and community updates, check the project roadmap and the new package release announcements.`,
		].join('\n');

		fs.writeFileSync(dest, placeholder, 'utf8');
		console.log(`No core changelog found; wrote placeholder to ${dest}`);
		return;
	}

	const content = fs.readFileSync(src, 'utf8');
	fs.writeFileSync(dest, header + content, 'utf8');
	console.log(`Copied changelog from ${src} to ${dest}`);
}

main();
