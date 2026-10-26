import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";

export default function AppShell({
  children,
  title,
  backHref,
}: {
  children: ReactNode;
  title?: string;
  backHref?: string;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 pb-24 dark:bg-slate-950">
      {title && <PageHeader title={title} backHref={backHref} />}
      {children}
      <BottomNav />
    </div>
  );
}
