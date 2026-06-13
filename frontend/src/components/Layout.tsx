import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type LayoutProps = {
  children: ReactNode
  wide?: boolean
}

function Layout({ children, wide = false }: LayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-brand-700">
          SpendWise
        </Link>
      </div>

      <section className={`mx-auto ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>{children}</section>
    </main>
  )
}

export default Layout