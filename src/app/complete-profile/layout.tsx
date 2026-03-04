import SignupHeader from '@/components/SignupHeader';
import Footer from '@/components/Footer';

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex-shrink-0">
        <SignupHeader sticky={false} />
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <footer className="flex-shrink-0">
        <Footer />
      </footer>
    </div>
  );
}
