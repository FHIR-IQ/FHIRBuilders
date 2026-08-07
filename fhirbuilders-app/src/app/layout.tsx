import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Editorial type system: a confident serif masthead face, a grotesk for running
// text and UI, and a mono for labels, data, and FHIR references (the technical
// undertone). Deliberately not Inter.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Healthcare AI Builders — Ship healthcare AI on real FHIR",
    template: "%s | Healthcare AI Builders",
  },
  description:
    "A build cohort for healthcare AI on real FHIR data. Twelve weeks, weekly demos, your own agents. Build, ship, and show your work.",
  keywords: [
    "FHIR",
    "HL7",
    "healthcare",
    "interoperability",
    "AI",
    "agentic AI",
    "healthcare apps",
    "medical software",
    "EHR integration",
    "SMART on FHIR",
  ],
  authors: [{ name: "Healthcare AI Builders Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fhirbuilders.com",
    siteName: "Healthcare AI Builders",
    title: "Healthcare AI Builders — Ship healthcare AI on real FHIR",
    description:
      "A build cohort for healthcare AI on real FHIR data. Twelve weeks, weekly demos, your own agents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healthcare AI Builders — Ship healthcare AI on real FHIR",
    description:
      "A build cohort for healthcare AI on real FHIR data. Twelve weeks, weekly demos, your own agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
