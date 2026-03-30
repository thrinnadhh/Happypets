import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://happypets.example.com'),
  title: {
    template: "%s | Happypets",
    default: "Happypets - Premium Pet Food Ecommerce",
  },
  description: "Natural and organic pet food for your furry friends. Shop premium brands and get quick delivery.",
  keywords: ["pet food", "organic dog food", "cat supplies", "pet care", "Happypets"],
  authors: [{ name: "Happypets Team" }],
  creator: "Happypets",
  publisher: "Happypets",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Happypets - Premium Pet Food Ecommerce",
    description: "Natural and organic pet food for your furry friends. Shop premium brands and get quick delivery.",
    url: 'https://happypets.example.com',
    siteName: 'Happypets',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Happypets - Premium Pet Food',
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happypets - Premium Pet Food',
    description: 'Natural and organic pet food for your furry friends.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${rubik.variable} ${nunitoSans.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary">
          Skip to content
        </a>
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
