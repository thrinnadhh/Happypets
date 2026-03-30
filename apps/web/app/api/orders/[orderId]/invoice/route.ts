// apps/web/app/api/orders/[orderId]/invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createServerClient } from '@/lib/supabase/server';
import { GSTInvoice } from '@repo/shared/lib/invoice';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch order with items, address, and shop details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      addresses(*),
      order_items(*, shops(name, gst_number))
    `)
    .eq('id', params.orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Verify ownership or admin access
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (order.user_id !== user.id && profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (order.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Invoice available only for paid orders' }, { status: 400 });
  }

  const invoiceData = {
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
    customer: {
      name: order.addresses.full_name,
      phone: order.addresses.phone,
      address: `${order.addresses.address_line1}${order.addresses.address_line2 ? ', ' + order.addresses.address_line2 : ''}`,
      city: order.addresses.city,
      state: order.addresses.state,
      pincode: order.addresses.pincode,
    },
    shop: {
      name: order.order_items[0]?.shops?.name ?? 'TheHappyPets Seller',
      gstNumber: order.order_items[0]?.shops?.gst_number ?? null,
    },
    items: order.order_items.map((item: any) => ({
      name: item.product_name,
      variantName: item.variant_name,
      quantity: item.quantity,
      unitPrice: item.unit_price_inr,
      gstRate: item.gst_rate,
      total: item.total_inr,
    })),
    subtotal: order.subtotal_inr,
    gstAmount: order.gst_amount,
    shipping: order.shipping_inr,
    discount: order.discount_inr,
    total: order.total_inr,
    paymentMethod: order.payment_method,
    razorpayPaymentId: order.razorpay_payment_id,
  };

  const pdfBuffer = await renderToBuffer(<GSTInvoice data={invoiceData} />);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${order.order_number}.pdf"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
