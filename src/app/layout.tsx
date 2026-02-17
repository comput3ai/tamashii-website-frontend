import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tamashii — EVM Training',
  description: 'Training runs and status for Tamashii EVM coordinator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
