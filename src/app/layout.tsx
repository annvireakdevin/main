import type { Metadata } from "next";
// Self-hosted fonts — no runtime request to Google, better privacy & LCP.
import "@fontsource-variable/inter-tight";
import "@fontsource/instrument-serif";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annvireak Devin — Cybersecurity Engineer",
  description:
    "Technology Security engineer in Phnom Penh. Protecting digital systems, building intelligent security platforms, and working toward AI-powered cybersecurity products.",
  keywords: [
    "cybersecurity",
    "security engineer",
    "SIEM",
    "QRadar",
    "AI security",
    "Phnom Penh",
  ],
  openGraph: {
    title: "Annvireak Devin — Security, engineered in silence.",
    description:
      "Cybersecurity engineer building intelligent security platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        {/* Apply saved theme before first paint — no flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
