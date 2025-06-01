
import "./globals.css";
import ClientLayout from "./components/clientLayout";
import { UserProvider } from "@/context/userContext";



export const metadata = {
  title: "MyIstri",
  description: "Elaina",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={` antialiased`}
      ><UserProvider>
        <ClientLayout>
        {children}
      </ClientLayout>
      </UserProvider>
      </body>
    </html>
  );
}
