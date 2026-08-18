import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, purchase_order_id, purchase_order_name } = body;

    const khaltiSecret = process.env.KHALTI_LIVE_SECRET_KEY;

    if (!khaltiSecret) {
      return NextResponse.json(
        { message: "Khalti secret key is missing on the server" },
        { status: 500 },
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const res = await fetch(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${khaltiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: `${origin}/payment-success`,
          website_url: origin,
          amount: parseInt(amount) * 100,
          purchase_order_id,
          purchase_order_name: purchase_order_name || "EasyBuy Order",
        }),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Khalti initialization failed" },
      { status: 500 },
    );
  }
}
