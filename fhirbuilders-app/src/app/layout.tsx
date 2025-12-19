import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FHIRBuilders - Healthcare AI & FHIR App Marketplace",
    template: "%s | FHIRBuilders",
  },
  description:
    "Build, share, and collaborate on agentic AI healthcare applications using FHIR standards. Access sandboxes, sample data, and connect with the community.",
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
  authors: [{ name: "FHIRBuilders Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fhirbuilders.com",
    siteName: "FHIRBuilders",
    title: "FHIRBuilders - Healthcare AI & FHIR App Marketplace",
    description:
      "Build, share, and collaborate on agentic AI healthcare applications using FHIR standards.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FHIRBuilders - Healthcare AI & FHIR App Marketplace",
    description:
      "Build, share, and collaborate on agentic AI healthcare applications using FHIR standards.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
