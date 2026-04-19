import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getClothesDetail } from '@/modules/ecommerce/catalog/actions/get-clothes-detail'
import { ClothesDetailView } from '@/modules/ecommerce/catalog/ui/components/clothes-detail-view'

interface ClothesDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params
}: ClothesDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getClothesDetail(id)

  if (!result.success || !result.data) {
    return {
      title: 'Producto no encontrado | TELAR'
    }
  }

  return {
    title: `${result.data.name} | TELAR`,
    description: result.data.description || 'Prenda personalizada de TELAR'
  }
}

export default async function ClothesDetailPage({
  params
}: ClothesDetailPageProps) {
  const { id } = await params
  const result = await getClothesDetail(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <ClothesDetailView clothes={result.data} />
    </div>
  )
}
