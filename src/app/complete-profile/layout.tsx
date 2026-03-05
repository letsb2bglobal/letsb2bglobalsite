import SignupHeader from '@/components/SignupHeader';

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden scrollbar-hide">
      <header className="flex-shrink-0">
        <SignupHeader sticky={false} />
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}