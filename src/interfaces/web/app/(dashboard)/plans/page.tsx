import Plans from '../../../screens/Plans'

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ channelId?: string | string[] }>
}) {
  const query = await searchParams
  const initialChannelId =
    typeof query.channelId === 'string' ? query.channelId : ''

  return <Plans initialChannelId={initialChannelId} />
}
