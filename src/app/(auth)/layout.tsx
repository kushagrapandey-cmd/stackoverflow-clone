"use client";

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { session, hydrated, authChecked, verfiySession } = useAuthStore();
  const router = useRouter();

  // Only decide after state is hydrated and auth has been checked
  React.useEffect(() => {
    if (!hydrated) return;
    if (!authChecked) {
      void verfiySession();
      return;
    }
    if (session) {
      router.replace("/");
    }
  }, [hydrated, authChecked, session, router, verfiySession]);

  if (hydrated && authChecked && session) return null;

  return (
    <div className="">
      <div className="">{children}</div>
    </div>
  );
};

export default Layout;
