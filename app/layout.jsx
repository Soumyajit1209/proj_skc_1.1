import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from '../components/AuthGuard';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sadana- Dashboard",
  description: "A comprehensive solution for managing employee data, attendance, and leave applications.",
  icons: {
    icon : '/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen`}
      >
        <AuthProvider>
         
           
        <div className="w-full min-h-screen flex flex-col">{children}</div>
        
        </AuthProvider>
      </body>
    </html>
  );
}