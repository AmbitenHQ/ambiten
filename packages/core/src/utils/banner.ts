import figlet from 'figlet'; 
import { colorize } from './color-palatte';

export function showBanner() {
  try {
    const banner = figlet.textSync('TENRA CLI', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    console.log(colorize(banner, 'blue'));
  } catch (error) {
    console.warn(
      colorize('Figlet font not found or failed to load. Displaying fallback banner.', 'yellow'),
      error
    );
    console.log(colorize('=== Tenra Core CLI ===', 'blue'));
  }
}
