import React from "react";
import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
