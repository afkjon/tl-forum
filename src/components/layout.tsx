import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import Footer from "./footer";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>
        <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f2f2f3] dark:from-[#000000] dark:to-[#15162c]">
          {props.children}
        </div>
      </main>
      <Footer />
    </>
  );
}
