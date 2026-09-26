import Checkout from '../../../screens/Checkout'

export default async function CheckoutPage({ params }: { params: Promise<{ planSlug: string }> }) {
  const { planSlug } = await params
  return <Checkout planSlug={planSlug} />
}
