import { Suspense } from 'react';
import CompleteProfileContent from './CompleteProfileContent';
import AuthLayout from '@/components/AuthLayout';

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
