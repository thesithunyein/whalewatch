import { NextResponse } from "next/server";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

export async function GET() {
  try {
    const response = await fetch(
      "https://public-api.birdeye.so/token_list?sort_by=v24hUSD&sort_type=desc&offset=0&limit=50",
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY || "",
          "accept": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    const tokens = (data.data || []).map((token: any) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      liquidity: token.liquidity || 0,
      v24hUSD: token.v24hUSD || 0,
      v24hChange: token.v24hChange || 0,
      price: token.price || 0,
    }));

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    
    const mockTokens = [
      {
        address: "So11111111111111111111111111111111111111112",
        symbol: "SOL",
        name: "Solana",
        decimals: 9,
        liquidity: 150000000,
        v24hUSD: 850000000,
        v24hChange: 5.2,
        price: 170,
      },
      {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        liquidity: 50000000,
        v24hUSD: 120000000,
        v24hChange: 0.1,
        price: 1,
      },
      {
        address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        symbol: "BONK",
        name: "Bonk",
        decimals: 5,
        liquidity: 25000000,
        v24hUSD: 45000000,
        v24hChange: -2.3,
        price: 0.000025,
      },
    ];

    return NextResponse.json({ 
      tokens: mockTokens,
      note: "Using mock data - API may need configuration",
    });
  }
}
