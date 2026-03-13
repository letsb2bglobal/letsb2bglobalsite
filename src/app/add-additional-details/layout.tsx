import ProtectedRoute from '@/components/ProtectedRoute';
import { DetailsProvider } from './DetailsContext';
import DetailsLayoutComponent from './DetailsLayout';

export default function AddAdditionalDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DetailsProvider>
        <DetailsLayoutComponent>
          {children}
        </DetailsLayoutComponent>
      </DetailsProvider>
    </ProtectedRoute>
  );
}
