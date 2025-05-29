'use client';

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const noNavbarPages = ["/Login", "/Register"];
  const sembunyikanNavbar = noNavbarPages.includes(pathname);

  const contentClass = sembunyikanNavbar ? '' : 'pt-16';

  return (
    <>
      {!sembunyikanNavbar && <Navbar />}
      <main className={contentClass}>

      {children}
      </main>
    </>
  );
}
