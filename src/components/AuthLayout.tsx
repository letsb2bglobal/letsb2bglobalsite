import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
      {/* Left Section */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="w-72 h-48 bg-gray-300 rounded-md mb-6" />
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
          List Your Business
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
