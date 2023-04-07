import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>
        <div className="min-h-screen bg-gradient-to-b from-[#1c0433] to-[#15162c]">
          {props.children}
        </div>
      </main>
    </>
  );
}
