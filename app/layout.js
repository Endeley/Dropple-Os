import '@/workspaces/modes/registerModes';
import '../ui/styles/globals.css';
import Providers from './providers';

export const metadata = {
  title: "Dropple",
  description: "Creative Intelligence Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
