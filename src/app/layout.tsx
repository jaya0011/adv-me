import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jaya Arora · Full-Stack Developer, on loop",
  description:
    "Jaya Arora is a full-stack and freelance developer from Amritsar who builds web apps, mobile apps, ecommerce stores and WordPress solutions. Explore the work, then play the arcade.",
  keywords: ["Jaya Arora", "Full-Stack Developer", "Freelance Developer", "Next.js", "React Native", "WordPress", "Amritsar"],
  authors: [{ name: "Jaya Arora" }],
  openGraph: {
    title: "Jaya Arora · Full-Stack Developer, on loop",
    description: "Web apps, mobile apps, ecommerce and WordPress, plus an arcade you'll keep coming back to.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060f",
};

// Applies the saved theme and intro state before first paint to avoid a flash.
const bootScript = `(function(){try{var s=JSON.parse(localStorage.getItem('jaya-loop-v1')||'{}');if(s.theme)document.documentElement.dataset.theme=s.theme;if(sessionStorage.getItem('jaya-loop-session'))document.documentElement.classList.add('intro-seen');}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="nebula"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
