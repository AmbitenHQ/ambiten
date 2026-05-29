#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/*
	Simple image -> ANSI color ASCII converter (CommonJS).
	Uses Jimp to load and resize the image and emits 24-bit ANSI using the '▀' block
	where foreground is the top pixel and background is the bottom pixel.
	Usage: node scripts/img2ansi.js <input.png> <output.txt> [width]
*/
const fs = require('fs');
const path = require('path');

async function run() {
	// dynamic import of jimp to handle both CJS/ESM installations
	const jimpMod = await import('jimp').catch((e) => {
		// try require fallback if dynamic import fails
		try {
			return require('jimp');
		} catch (err) {
			throw e;
		}
	});
	const Jimp = jimpMod.default || jimpMod;
	const args = process.argv.slice(2);
	if (args.length < 2) {
		console.error('Usage: node scripts/img2ansi.js <in.png> <out.txt> [width]');
		process.exit(1);
	}
	const inPath = path.resolve(args[0]);
	const outPath = path.resolve(args[1]);
	const width = parseInt(args[2], 10) || 80;

	const img = await Jimp.read(inPath);
	// For the half-block method, we'll keep width characters and map 2 pixels per char vertically
	const aspect = img.bitmap.height / img.bitmap.width;
	const targetW = width;
	const targetH = Math.max(2, Math.round(aspect * targetW));
	// Ensure even height for pairing
	const evenH = targetH % 2 === 0 ? targetH : targetH + 1;
	await img.resize(targetW, evenH, Jimp.RESIZE_BEZIER);

	const lines = [];
	for (let y = 0; y < evenH; y += 2) {
		let line = '';
		for (let x = 0; x < targetW; x++) {
			const topIdx = img.getPixelColor(x, y);
			const botIdx = img.getPixelColor(x, y + 1);
			const top = Jimp.intToRGBA(topIdx);
			const bot = Jimp.intToRGBA(botIdx);
			// If alpha is zero, treat as transparent -> use space
			if (top.a === 0 && bot.a === 0) {
				line += ' ';
				continue;
			}
			const fg = `\x1b[38;2;${top.r};${top.g};${top.b}m`;
			const bg = `\x1b[48;2;${bot.r};${bot.g};${bot.b}m`;
			line += `${fg}${bg}▀`;
		}
		// reset color at end
		line += '\x1b[0m';
		lines.push(line);
	}

	const out = lines.join('\n') + '\n';
	fs.writeFileSync(outPath, out, 'utf8');
	console.log('Wrote ANSI art to', outPath);
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
