import SignupHeader from '@/components/SignupHeader';

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-gray-100 overflow-x-hidden">
      <header className="flex-shrink-0">
        <SignupHeader sticky />
      </header>

      <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-screen-xl mx-auto min-w-0 overflow-x-hidden py-10">
        {children}
        </div>
      </main>
    </div>
  );
}