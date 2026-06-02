import figlet from 'figlet';
import { colorize } from './colorize';

export function showBanner() {
  try {
    const banner = figlet.textSync('Ambiten CLI', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    console.log(colorize(banner, 'cyan'));
  } catch (error) {
    // Keep the output concise for environments (npx, npm pack) where
    // the bundled fonts directory may not be present. We still warn,
    // but avoid printing the full stack/ENOENT path to prevent noisy
    // output for consumers.
    console.warn(
      colorize('⚠️ Figlet font not found or failed to load. Displaying fallback banner.', 'yellow')
    );
    console.log(colorize('=== Ambiten CLI ===', 'cyan'));
  }
}
