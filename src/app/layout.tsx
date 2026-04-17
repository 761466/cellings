import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Cellings · 3D 바디스캔 맞춤 운영 플랫폼",
    template: "%s · Cellings",
  },
  description:
    "전국 대리점과 본사를 하나로 잇는 3D 바디스캔 맞춤 제작·주문·통계 통합 플랫폼. 베개·신발·의류·보정속옷 등 카테고리별 맞춤 제작을 지원합니다.",
  keywords: [
    "3D 바디스캔",
    "맞춤 제작",
    "대리점 관리",
    "주문 관리",
    "Cellings",
    "본사 관리 시스템",
  ],
  openGraph: {
    title: "Cellings · 3D 바디스캔 맞춤 운영 플랫폼",
    description:
      "전국 대리점과 본사를 하나로 잇는 3D 바디스캔 맞춤 제작·주문·통계 통합 플랫폼.",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/cellings_opengraph.png",
        width: 1200,
        height: 630,
        alt: "Cellings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cellings · 3D 바디스캔 맞춤 운영 플랫폼",
    description:
      "전국 대리점과 본사를 하나로 잇는 3D 바디스캔 맞춤 제작·주문·통계 통합 플랫폼.",
    images: ["/cellings_opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
