import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Parley — learn a language by living in it",
  description:
    "An explorable risograph world where the only way forward is to talk your way through it, in the language you're learning, with characters who remember you. Built on 0G.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${newsreader.variable} ${spaceMono.variable} ${pixel.variable} h-full`}
    >
      <body className="grain min-h-full">{children}</body>
    </html>
  );
}
