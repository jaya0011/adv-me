import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono, Silkscreen } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: "italic" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const silkscreen = Silkscreen({ variable: "--font-silkscreen", subsets: ["latin"], weight: "400", preload: false });

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
  themeColor: "#05070c",
};

// Applies the saved theme and intro state before first paint to avoid a flash.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var s=JSON.parse(localStorage.getItem('jaya-loop-v1')||'{}');if(s.theme&&s.theme!=='paper')d.dataset.theme=s.theme;if(sessionStorage.getItem('jaya-loop-session'))d.classList.add('intro-seen');}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="nebula"
      suppressHydrationWarning
      className={`${geist.variable} ${serif.variable} ${jetbrains.variable} ${silkscreen.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly…) add attributes to body before hydration. */}
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
