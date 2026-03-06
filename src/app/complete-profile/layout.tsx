import SignupHeader from '@/components/SignupHeader';

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen min-h-dvh overflow-x-hidden">
      <header className="flex-shrink-0">
        <SignupHeader sticky={false} />
      </header>

      <main className="flex-1 min-h-0">
        {children}
      </main>
    </div>
  );
}