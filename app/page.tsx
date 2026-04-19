import Link from 'next/link'

import { ArrowRightIcon, LogInIcon, UserPlusIcon } from 'lucide-react'

export const metadata = {
  title: 'Bienvenido a Telar',
  description:
    'Gestiona operaciones, personal y ventas desde una experiencia clara, moderna y construida para tu ritmo diario.'
}

export default function Home() {
  return (
    <div className='min-h-svh bg-[#faf9f8] text-[#1a1c1c]'>
      <header className='fixed top-0 z-50 w-full bg-[#faf9f8]/85 backdrop-blur-lg'>
        <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4'>
          <div className='text-2xl font-black tracking-tight text-[#2b1608]'>Telar</div>
        </div>
      </header>

      <main className='relative mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-12'>
        <div className='pointer-events-none absolute top-[-10%] right-[-5%] h-[40rem] w-[40rem] rounded-full bg-[#2b1608]/5 blur-[120px]' />
        <div className='pointer-events-none absolute bottom-[-10%] left-[-5%] h-[30rem] w-[30rem] rounded-full bg-[#765846]/10 blur-[100px]' />

        <section className='mb-16 max-w-4xl text-center'>
          <h1 className='text-5xl leading-tight font-extrabold tracking-tight text-[#2b1608] md:text-7xl'>
            Bienvenido a Telar
          </h1>
          <p className='mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#50453f] md:text-lg'>
            Gestiona operaciones, personal y ventas desde una experiencia clara,
            moderna y construida para tu ritmo diario.
          </p>
        </section>

        <section className='grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2'>
          <Link
            href='/sign-in'
            id='go-to-sign-in'
            className='group relative flex flex-col overflow-hidden rounded-xl border border-transparent bg-white p-8 text-left shadow-[0_8px_24px_rgba(43,22,8,0.06)] transition-all duration-300 hover:border-[#d3c3bb]/30 hover:shadow-[0_12px_32px_rgba(43,22,8,0.1)]'
          >
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#eeeeed] text-[#2b1608] transition-colors duration-300 group-hover:bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] group-hover:text-white'>
              <LogInIcon className='size-5' />
            </div>
            <h2 className='mb-2 text-2xl font-bold text-[#2b1608]'>Iniciar sesión</h2>
            <p className='mb-8 text-[#50453f]'>
              Continúa con tu operación y entra con tus credenciales.
            </p>
            <div className='mt-auto inline-flex items-center font-semibold text-[#2b1608]'>
              Entrar ahora
              <ArrowRightIcon className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
            </div>
          </Link>

          <Link
            href='/register'
            id='go-to-sign-up'
            className='group relative flex flex-col overflow-hidden rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] p-8 text-left text-white shadow-[0_8px_24px_rgba(43,22,8,0.15)] transition-all duration-300 hover:scale-[1.02]'
          >
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10'>
              <UserPlusIcon className='size-5' />
            </div>
            <h2 className='mb-2 text-2xl font-bold'>Crear cuenta</h2>
            <p className='mb-8 text-white/80'>
              Regístrate en minutos y verifica tu correo en el mismo flujo.
            </p>
            <div className='mt-auto inline-flex items-center font-semibold'>
              Empezar hoy
              <ArrowRightIcon className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
            </div>
            <div className='absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/10 blur-2xl' />
          </Link>
        </section>
      </main>

      <footer className='border-transparent py-8'>
        <div className='mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-8 md:flex-row'>
          <p className='text-sm tracking-widest text-stone-400 uppercase'>© 2026 Telar.</p>
        </div>
      </footer>
    </div>
  )
}
