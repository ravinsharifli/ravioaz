import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ravio — Sizə Özəl Hədiyyələr | Bakı',
  description: 'Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. Bakıda pulsuz çatdırılma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}