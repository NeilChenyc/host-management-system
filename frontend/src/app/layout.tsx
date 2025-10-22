
import "./globals.css";
import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import React19Compatibility from '@/components/React19Compatibility';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <React19Compatibility />
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}