import { getServerSession } from 'next-auth/next'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession()

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to My App </h1>
      {session ? (
        <div>
          <p className="text-xl mb-4">Hello, {session.user?.name}!</p>
           
        </div>
      ) : (
        <p className="text-xl mb-4">
          Please <Link href="/auth/signin" className="text-blue-500 hover:text-blue-600">sign in</Link> to access all features.
        </p>
      )}
    </div>
  )
}