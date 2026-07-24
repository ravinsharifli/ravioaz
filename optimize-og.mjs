/**
 * OG şəklini sıxışdırır (varsa). Build uğursuz olmaz — xəta olsa skip.
 */
import { existsSync } from 'fs';

const INPUT = 'public/og-ravio.png';

async function run() {
  if (!existsSync(INPUT)) {
    console.log('ℹ️  optimize-og: public/og-ravio.png tapılmadı — skip');
    return;
  }

  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(INPUT).metadata();
    const before = (await import('fs')).statSync(INPUT).size;

    await sharp(INPUT)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .png({ quality: 82, compressionLevel: 9, palette: true })
      .toFile('public/og-ravio.opt.png');

    const { renameSync, statSync } = await import('fs');
    renameSync('public/og-ravio.opt.png', INPUT);

    await sharp(INPUT)
      .resize(1200, 630, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile('public/og-ravio.webp');

    const after = statSync(INPUT).size;
    const webpSize = statSync('public/og-ravio.webp').size;
    console.log(
      `✅ OG şəkil: PNG ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB, WebP ${Math.round(webpSize / 1024)}KB (${meta.width}x${meta.height})`,
    );
  } catch (err) {
    console.warn('⚠️  optimize-og skip:', err.message);
  }
}

run();
