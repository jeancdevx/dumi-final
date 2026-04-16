import Link from 'next/link'

import { ECOMMERCE_ROUTES } from '@/modules/ecommerce/auth/constants'

interface EcommerceAuthLayoutProps {
  children: React.ReactNode
}

export default function EcommerceAuthLayout({
  children
}: EcommerceAuthLayoutProps) {
  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Header simple */}
      <header className='border-b'>
        <div className='container mx-auto flex h-16 items-center px-4'>
          <Link href={ECOMMERCE_ROUTES.CATALOG} className='text-xl font-bold'>
            TELAR
          </Link>
        </div>
      </header>

      {/* Contenido centrado */}
      <main className='flex flex-1 items-center justify-center p-4'>
        <div className='w-full max-w-md'>{children}</div>
      </main>

      {/* Footer simple */}
      <footer className='border-t py-6'>
        <div className='text-muted-foreground container mx-auto px-4 text-center text-sm'>
          © {new Date().getFullYear()} TELAR. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
