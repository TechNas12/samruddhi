import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata = {
  title: "Samruddhi Organics — Organic Farming for Urban Living",
  description: "Samruddhi Organics helps you develop farming experiences in your urban lifestyle. Shop composts, organic fruits, seeds, garden tools and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
