export async function GET() {
  return Response.json({
    ars: {
      alias: process.env.PAY_ARS_ALIAS,
      cbu: process.env.PAY_ARS_CBU,
      holder: process.env.PAY_ARS_HOLDER
    },
    usd: {
      cbu: process.env.PAY_USD_CBU,
      alias: process.env.PAY_USD_ALIAS,
      bank: process.env.PAY_USD_BANK,
      ach: {
        name: process.env.PAY_ACH_NAME,
        routing: process.env.PAY_ACH_ROUTING,
        account: process.env.PAY_ACH_ACCOUNT,
        type: process.env.PAY_ACH_TYPE,
        bank: process.env.PAY_ACH_BANK,
        address: process.env.PAY_ACH_ADDRESS
      }
    },
    crypto: {
      btc: process.env.PAY_BTC,
      usdt: process.env.PAY_USDT,
      usdc: process.env.PAY_USDC
    }
  });
}
