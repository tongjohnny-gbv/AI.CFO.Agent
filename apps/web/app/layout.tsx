import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="p-6 max-w-5xl mx-auto">
        <header className="mb-6 flex gap-4 text-sm">
          <Link href="/">Dashboard</Link>
          <Link href="/upload">Upload</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/reports">Reports</Link>
          <Link href="/orgs">Orgs</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
