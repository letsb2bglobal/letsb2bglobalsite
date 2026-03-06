import SignupHeader from '@/components/SignupHeader';

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-gray-100" style={{ overflowX: "clip" }}>
      <header className="flex-shrink-0">
        <SignupHeader sticky />
      </header>

      <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full overflow-visible py-10">
        {children}
      </main>
    </div>
  );
}