import { NextResponse } from "next/server";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;
const QUICKNODE_RPC_URL = process.env.QUICKNODE_RPC_URL;

// Known whale wallet addresses on Solana
const KNOWN_WHALES = [
  "7xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
  "3yKz1VZ2ZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
  "9xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
];

export async function GET() {
  try {
    // Fetch whale transactions from Birdeye
    const response = await fetch(
      "https://public-api.birdeye.so/defi/txs/whale?address=So11111111111111111111111111111111111111112",
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY || "",
          "accept": "application/json",
        },
        next: { revalidate: 10 }, // Cache for 10 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to our format
    const transactions = (data.data || []).slice(0, 20).map((tx: any) => ({
      blockTime: tx.blockTime || Date.now() / 1000,
      tokenSymbol: tx.tokenSymbol || "SOL",
      amount: tx.amount || 0,
      valueUsd: tx.valueUsd || 0,
      from: tx.from || "unknown",
      to: tx.to || "unknown",
      priceImpact: tx.priceImpact || 0,
      txHash: tx.txHash || "",
    }));

    return NextResponse.json({
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching whale transactions:", error);
    
    // Return mock data for demo if API fails
    const mockTransactions = [
      {
        blockTime: Date.now() / 1000 - 60,
        tokenSymbol: "SOL",
        amount: 5000,
        valueUsd: 850000,
        from: "7xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        to: "3yKz1VZ2ZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        priceImpact: 2.5,
        txHash: "mock-tx-1",
      },
      {
        blockTime: Date.now() / 1000 - 120,
        tokenSymbol: "BONK",
        amount: 1000000000,
        valueUsd: 15000,
        from: "9xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        to: "4yKz1VZ2ZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        priceImpact: 0.8,
        txHash: "mock-tx-2",
      },
      {
        blockTime: Date.now() / 1000 - 180,
        tokenSymbol: "WIF",
        amount: 500000,
        valueUsd: 45000,
        from: "5xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        to: "6yKz1VZ2ZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
        priceImpact: 1.2,
        txHash: "mock-tx-3",
      },
    ];

    return NextResponse.json({
      transactions: mockTransactions,
      count: mockTransactions.length,
      note: "Using mock data - API may need configuration",
    });
  }
}
