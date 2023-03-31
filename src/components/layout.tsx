import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>
        {props.children}
      </main>
    </>
  );
}
