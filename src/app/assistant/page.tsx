import AppShell from "@/components/AppShell";

export default function AssistantPage() {
  return (
    <AppShell title="AI Assistant">
      <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl dark:bg-teal-900/30">
          ◎
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Voice assistant coming soon</h2>
        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
          The AI voice assistant (screen navigation, guided transfers, product explanations) is planned
          for a later phase of this project and isn&apos;t wired up yet.
        </p>
      </div>
    </AppShell>
  );
}
