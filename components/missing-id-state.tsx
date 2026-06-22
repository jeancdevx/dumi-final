'use client'

import Link from 'next/link'

import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface MissingIdStateProps {
  title: string
  description: string
  backHref: string
  backLabel: string
}

export function MissingIdState({
  title,
  description,
  backHref,
  backLabel
}: MissingIdStateProps) {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p>{description}</p>
          <Button asChild variant='outline' size='sm' className='mt-2'>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
