import OrderClient from "@/app/components/OrderClient";

export default async function OrderPage({ params }: { params: any }) {
  const p = await Promise.resolve(params);
  const orderId = String(p?.orderId || "");

  return <OrderClient orderId={orderId} />;
}
