import { OrdersFilters } from '@/modules/orders/ui/components/orders-filters'
import { OrdersSearchResults } from '@/modules/orders/ui/components/orders-search-results'

export default function OrdersPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Órdenes</h1>
          <p className='text-muted-foreground'>
            Gestiona la producción y entrega de pedidos
          </p>
        </div>
      </div>

      <OrdersFilters />

      <OrdersSearchResults />
    </div>
  )
}
