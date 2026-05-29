// #!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
/* Lightweight text-to-banner converter */
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const { visibleLength } = require('./wcwidth');

const input = argv._[0] || path.join('TENRA-brand', 'extras', 'cli_splash.txt');
const out = argv.o || path.join('TENRA-brand', 'extras', 'cli_splash.txt');
const preview = !!(argv.preview || argv.p || argv.stdout || argv.s);
const noHeader = !!(argv.noheader || argv.n);

function esc(r, g, b) { return `\x1b[38;2;${r};${g};${b}m`; }
function reset() { return '\x1b[0m'; }

// visibleLength has been extracted to ./wcwidth.js and accounts for ANSI escapes

function padPrintable(s, width) {
	const printable = visibleLength(s);
	const left = Math.floor((width - printable) / 2);
	const right = width - printable - left;
	return ' '.repeat(left) + s + ' '.repeat(right);
}

function makePlainBox(lines, hpad = 2, vpad = 1) {
	const contentMax = lines.reduce((m, l) => Math.max(m, visibleLength(l)), 0);
	const inner = contentMax + hpad * 2;
	// rounded corners for a softer border
	const tl = '╭', tr = '╮', bl = '╰', br = '╯', hor = '─', ver = '│';
	const top = tl + hor.repeat(inner) + tr;
	const bottom = bl + hor.repeat(inner) + br;
	const empty = ver + ' '.repeat(inner) + ver;
	const outLines = [top];
	for (let i = 0; i < vpad; i++) outLines.push(empty);
	for (const l of lines) {
		const body = padPrintable(l, contentMax);
		outLines.push(ver + ' '.repeat(hpad) + body + ' '.repeat(hpad) + ver);
	}
	for (let i = 0; i < vpad; i++) outLines.push(empty);
	outLines.push(bottom);
	return outLines.join('\n') + '\n';
}

function makeAnsiBox(lines, hpad = 2, vpad = 1, preImage = '') {
	// use visibleLength to account for ANSI escapes and wide glyphs
	const contentMax = lines.reduce((m, l) => Math.max(m, visibleLength(l)), 0);
	const inner = contentMax + hpad * 2;
	// TENRA brand teal: #00C4B4 -> rgb(0,196,180)
	const border = esc(0, 196, 180);
	const text = esc(255, 255, 255);
	// rounded corners
	const tl = '╭', tr = '╮', bl = '╰', br = '╯', hor = '─', ver = '│';
	const top = border + tl + hor.repeat(inner) + tr + reset();
	const bottom = border + bl + hor.repeat(inner) + br + reset();
	const empty = border + ver + reset() + ' '.repeat(inner) + border + ver + reset();
	const outLines = [];
	outLines.push(top);
	// if we have an inline image payload, render it as a centered inner line
	if (preImage) {
		// preImage is an escape sequence; center it visually by padding
		const leftPad = Math.floor((inner - 0) / 2); // image has no printable width
		const rightPad = inner - leftPad;
		const imgLine = border + ver + reset() + ' '.repeat(leftPad) + preImage + ' '.repeat(rightPad) + border + ver + reset();
		outLines.push(imgLine);
	}
	for (let i = 0; i < vpad; i++) outLines.push(empty);
	for (const l of lines) {
		// color the subtitle (user request): "MongoDB toolkit" in TENRA teal
		let colored;
		if (/MongoDB toolkit/i.test(l)) {
			colored = esc(0, 196, 180) + l + reset();
		} else {
			colored = text + l + reset();
		}
		const body = padPrintable(colored, contentMax);
		outLines.push(border + ver + reset() + ' '.repeat(hpad) + body + ' '.repeat(hpad) + border + ver + reset());
	}
	for (let i = 0; i < vpad; i++) outLines.push(empty);
	outLines.push(bottom);
	return outLines.join('\n') + '\n';
}

// attempt to discover a brand logo file
function findLogo() {
	const candidates = [
		'TENRA-brand/logo_horizontal.png',
		'TENRA-brand/logo_light.png',
		'TENRA-brand/logo_dark.png',
		'TENRA-brand/logo_monochrome_white.png',
		'TENRA-brand/logo_monochrome_black.png',
		'TENRA-brand/icon_gradient.png',
		'TENRA-brand/standalone_A.png',
	];
	for (const c of candidates) if (fs.existsSync(c)) return c;
	return null;
}

// embed image for iTerm2 or Kitty if available (simple iTerm and Kitty support)
function embedImageIfSupported(imgPath) {
	if (!imgPath) return '';
	try {
		const data = fs.readFileSync(imgPath);
		const b64 = data.toString('base64');
		// iTerm2 inline image
		if (process.env.TERM_PROGRAM === 'iTerm.app') {
			// name is optional; inline=1 to show
			return `\x1b]1337;File=inline=1;width=auto;height=auto;preserveAspectRatio=1:${b64}\x07`;
		}
		// Kitty graphics protocol
		if (process.env.KITTY_WINDOW_ID) {
			// send as a single chunk
			return `\x1b_Gf=100;t=d;${b64}\x1b\\`;
		}
	} catch (e) {
		// ignore
	}
	return '';
}

// removed unused icon-generation helpers (kept file focused on text banners)

function ensureDirFor(filePath) {
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function run() {
	if (!fs.existsSync(input)) {
		console.error(`Input not found: ${input}`);
		process.exit(2);
	}

	const txt = fs.readFileSync(input, 'utf8');
	// If the input already contains ANSI/banner chars (we previously overwrote
	// the file with a generated banner), try to extract the visible text by
	// stripping ANSI escapes and box characters so we can rebuild a fresh box.
	let rawLines;
	const ESC = String.fromCharCode(27);
	if (txt.includes(ESC) || /[┌┐└┘│─╭╮╰╯]/.test(txt)) {
		// remove ANSI SGR sequences then strip any box-drawing characters anywhere in the line
		const stripped = txt.replace(new RegExp(ESC + '\\[[0-9;]*m', 'g'), '');
		rawLines = stripped.split(/\r?\n/).map(l => l.replace(/[╭╮╰╯┌┐└┘─│]/g, '').replace(/^\s+|\s+$/g, ''));
	} else {
		rawLines = txt.split(/\r?\n/).map(l => l.replace(/\s+$/u, ''));
	}
	// Remove any auto-generated header lines that came from previous script runs
	// (e.g. "# Generated by scripts/convert-splash.js - ...")
	const filtered = rawLines.filter(l => !/^#\s*Generated by scripts\/convert-splash/.test(l));
	// Clamp lines to a reasonable maximum width to keep the box compact
	const maxWidth = parseInt(argv.maxWidth || argv.w || '60', 10) || 60;
	const contentLines = filtered.map(l => (l.length > maxWidth ? l.slice(0, maxWidth) : l)).filter(l => l.trim().length > 0);

	// try to auto-find a brand logo to embed (iTerm/Kitty only)
	const logo = findLogo();
	const preImage = embedImageIfSupported(logo);

	// normalize wide glyphs (circled A / emoji) to plain 'A' for consistent width
	const normalizeWide = s => s.replace(/🅰|Ⓐ/g, 'A');
	const plainLines = contentLines.map(normalizeWide);
	// remove any leading standalone icon/token (emoji/circled A or ASCII 'A') that prefixes 'TENRA'
	for (let i = 0; i < plainLines.length; i++) {
		plainLines[i] = plainLines[i].replace(/^\s*(?:🅰|Ⓐ|A)\s+(?=TENRA\b)/i, '');
	}
	// ANSI lines mirror plain lines (no icon);
	const ansiLines = plainLines.slice();

	// width measurement is handled by visibleLength (wcwidth) so ad-hoc fixes removed
	// reduce vertical padding to keep the box compact (user requested)
	// Remove any header-like lines from the content so the ASCII header does
	// not re-appear inside the box. Match trimmed lines against the wordmark
	// and common separator patterns.
	// Try FIGlet first for a nicer ASCII wordmark (preview only).
	// If the `figlet` module isn't installed or generation fails, fall back
	// to a safe, plain ASCII wordmark that avoids problematic escape
	// sequences. This keeps written outputs stable while giving a nicer
	// preview when figlet is available.
	function getWordmarkLines() {
		try {
			// require on demand so the script works without an npm install.
			// If a user wants the FIGlet header permanently, they can
			// `pnpm add figlet` in their environment.
			// Use a compact font to keep the banner narrow.
			const figlet = require('figlet');
			const fig = figlet.textSync('TENRA', { font: 'Small' });
			const lines = String(fig).split(/\r?\n/).map(l => l.replace(/\s+$/u, ''));
			// Ensure a single-line literal 'TENRA' exists for tests and
			// simple consumers that look for the plain wordmark. Append a
			// centered literal if absent.
			if (!lines.some(l => l.trim() === 'TENRA')) {
				lines.push('                     TENRA                    ');
			}
			return lines;
		} catch (e) {
			return [
			'	888888888888888888888888b    8888888888b.        d8888   ',
			'			888    888       8888b   888888   Y88b      d88888   ',
			'			888    888       88888b  888888    888     d88P888   ',
			'			888    8888888   888Y88b 888888   d88P    d88P 888   ',
			'			888    888       888 Y88b8888888888P"    d88P  888   ',
			'			888    888       888  Y88888888 T88b    d88P   888   ',
			'			888    888       888   Y8888888  T88b  d8888888888   ',
			'			888    8888888888888    Y888888   T88bd88P     888   ',
			'                                                          ',
			'                           TENRA                          '
			];
		}
	}

	const wordmarkLines = getWordmarkLines();

	const headerTrim = wordmarkLines.map(l => l.trim()).filter(Boolean);
	// Heuristic: detect FIGlet/ASCII-art lines that are mostly non-alphanumeric
	// characters (e.g. underscores, slashes, pipes) and exclude them from the box
	// so the FIGlet header only appears above the box (preview). This avoids
	// re-including large ASCII art blocks read from previously generated files.
	function isAsciiArtLine(s) {
		if (!s) return false;
		const len = s.trim().length;
		if (len < 6) return false; // short lines aren't considered art
		const alnum = (s.match(/[A-Za-z0-9]/g) || []).length;
		// ratio of alphanumeric chars to total
		const ratio = alnum / len;
		// if fewer than 30% of chars are alphanumeric, treat as art
		return ratio < 0.3;
	}
	const cleanedPlainLines = plainLines.filter(l => {
		const t = l.trim();
		if (!t) return false;
		if (isAsciiArtLine(t)) return false;
		if (headerTrim.includes(t)) return false;
		if (/^=+$/.test(t)) return false;
		// only exclude exact TENRA line; keep 'TENRA — ...' title
		if (/^TENRA\s*$/i.test(t)) return false;
		return true;
	});

	const cleanedAnsiLines = ansiLines.filter(a => {
		const sgr = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
		const t = a.replace(sgr, '').trim();
		if (!t) return false;
		if (isAsciiArtLine(t)) return false;
		if (headerTrim.includes(t)) return false;
		if (/^=+$/.test(t)) return false;
		if (/^TENRA\s*$/i.test(t)) return false;
		return true;
	});

	// Ensure the box contains the title line. If it was removed by filtering,
	// reinsert the canonical title at the top of the box.
	const hasTitle = cleanedPlainLines.some(l => /^TENRA\b/i.test(l));
	if (!hasTitle) {
		const titleFromInput = plainLines.find(l => /^TENRA\b/i.test(l));
		const titleToInsert = titleFromInput || 'TENRA — fast, multi-tenant';
		cleanedPlainLines.unshift(titleToInsert);
		// for ANSI, try to find an ANSI-wrapped version; otherwise insert plain title
		const ansiTitleFromInput = ansiLines.find(a => a.replace(new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g'), '').match(/^TENRA\b/i));
		cleanedAnsiLines.unshift(ansiTitleFromInput || titleToInsert);
	}


	const plainBox = makePlainBox(cleanedPlainLines, 2, 0);
	const ansiBox = makeAnsiBox(cleanedAnsiLines, 2, 1, preImage);

	// Compose final outputs with wordmark on top (plain + ANSI)
	const plain = wordmarkLines.join('\n') + '\n' + plainBox;
	// color the wordmark for ANSI output using the brand teal
	const teal = esc(0, 196, 180);
	const resetSeq = reset();
	const ansiWordmark = wordmarkLines.map(l => teal + l + resetSeq).join('\n') + '\n';
	const ansi = ansiWordmark + ansiBox;

	const origOut = out.replace(/(\.txt)$/i, '.orig$1');
	const plainOut = out.replace(/(\.txt)$/i, '.plain$1');

	ensureDirFor(out);
	ensureDirFor(origOut);
	ensureDirFor(plainOut);

	// Write a sanitized original: strip ANSI and box characters so the .orig.txt
	// contains only the visible, clean text lines. This prevents overwriting
	// the source with banner escape sequences in future runs.
	try {
		const sanitized = contentLines.join('\n') + '\n';
		fs.writeFileSync(origOut, sanitized, 'utf8');
	} catch (e) { /* ignore */ }
	try { fs.writeFileSync(plainOut, plain, 'utf8'); } catch (e) { /* ignore */ }

	// By user request, do not include a generated header line; output contains only the boxed banner
	const final = ansi;

	if (preview) {
		process.stdout.write(final);
		console.error(`(preview) Generated boxed splash (ANSI) from ${input}`);
		return;
	}

	try { fs.writeFileSync(out, final, 'utf8'); } catch (e) { console.error('Failed to write output:', e); process.exit(1); }
	console.log(`Wrote boxed ANSI splash to ${out}`);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
