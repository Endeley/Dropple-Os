import '@/workspaces/modes/registerModes';
import "../ui/styles/globals.css";
import { ConvexProvider } from "../providers/ConvexProvider";

export const metadata = {
  title: "Dropple",
  description: "Creative Intelligence Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
