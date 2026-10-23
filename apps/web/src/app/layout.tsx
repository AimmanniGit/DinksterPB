import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dinkster Organizer & Court Desk',
  description: 'Tournament management, live court board, and AI copilot for pickleball operators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#dedad2] text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
