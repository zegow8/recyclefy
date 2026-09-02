import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Recyclefy',
  description: 'Platform Pengelolaan Sampah',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}