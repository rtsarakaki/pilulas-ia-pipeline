import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jogo da Velha Local',
  description: 'Jogo da Velha para jogar localmente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
