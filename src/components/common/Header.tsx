"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { navbar } from "@/lib/constant/app.constant";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 mr-auto">
          My App
        </Link>
        <div className="flex items-center space-x-4">
          <nav>
            <ul className="flex space-x-6">
              {navbar.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md"
                  >
                    <item.icon className="w-5 h-5 lg:mr-2" />
                    <span className="inline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hello, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
