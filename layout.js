import './globals.css';

export const metadata = {
  title: 'AquaSave AI',
  description: 'AI-powered household water saving assistant'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
