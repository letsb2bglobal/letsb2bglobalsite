import SignupHeader from '@/components/SignupHeader';

export default function AddAdditionalDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-gray-100" style={{ overflowX: 'clip' }}>
      <header className="flex-shrink-0">
        <SignupHeader sticky />
      </header>
      <div className="flex-1 pt-16">{children}</div>
    </div>
  );
}
