import { CreateQuotationPageClient } from '@/modules/quotations/ui/components/create-quotation-page-client'

export default function SellerNewQuotationPage() {
  return (
    <CreateQuotationPageClient
      homePath='/seller'
      basePath='/seller/quotations'
    />
  )
}
