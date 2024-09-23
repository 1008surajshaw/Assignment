"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
 
  LogOut,
  User,
} from "lucide-react";
import { navbar } from "@/lib/constant/app.constant";
import Image from "next/image";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-100 w-full text-black">
    {/* Sidebar */}
    <aside className="bg-white shadow-md  lg:w-[30%] transition-all duration-300 ease-in-out">
      <div className="p-4 hidden lg:block">
        <h1 className="text-2xl font-bold">My App</h1>
      </div>
      <nav className="mt-5">
        <ul>
          {navbar.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                <item.icon className="w-5 h-5 lg:mr-2" />
                <span className="inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0  lg:w-[20%] p-4">
        {session ? (
          <div className="flex items-center space-x-3">
            <Image
              src={session.user.image || "/api/placeholder/32/32"}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="block ">
              <p className="font-semibold text-black">{session.user.name}</p>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" /> 
                <span className="inline">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <User className="w-4 h-4 lg:mr-2" /> 
            <span className="hidden lg:inline">Sign In</span>
          </button>
        )}
      </div>
    </aside>

    {/* Main content area */}
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
  )
}