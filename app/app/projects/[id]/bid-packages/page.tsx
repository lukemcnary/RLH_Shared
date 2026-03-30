import { getBidPackages, getCostItems, getTradeTypes, getQuotes, getCompanies } from '@/lib/dataverse/adapter'
import { BidPackagesView } from '@/features/bid-packages/bid-packages-view'

export const metadata = { title: 'Bid Packages — RangelineOS' }

export default async function BidPackagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [bidPackages, costItems, tradeTypes, quotes, companies] = await Promise.all([
    getBidPackages(id),
    getCostItems(id),
    getTradeTypes(),
    getQuotes(),
    getCompanies(),
  ])

  return <BidPackagesView projectId={id} bidPackages={bidPackages} costItems={costItems} tradeTypes={tradeTypes} quotes={quotes} companies={companies} />
}
