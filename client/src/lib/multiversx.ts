import axios from "axios";

interface RawTransaction {
  sender: string;
  receiver: string;
  value: string;
  timestamp: number;
}

interface ProcessedTransaction {
  x: number;
  y: number;
  z: number;
  sender: string;
  receiver: string;
}

export async function fetchTransactions(address: string): Promise<ProcessedTransaction[]> {
  if (!address) return [];

  try {
    const response = await axios.get(
      `https://api.multiversx.com/transactions`, {
        params: {
          sender: address,
          receiver: address,
          size: 50,
          order: "desc"
        }
      }
    );

    return processTransactions(response.data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

function processTransactions(transactions: RawTransaction[]): ProcessedTransaction[] {
  return transactions.map((tx, index) => {
    // Convert value from denominated units (10^18) to EGLD
    const valueInEGLD = Number(tx.value) / Math.pow(10, 18);

    // Calculate bubble size using square root for better visual scaling
    const bubbleSize = Math.sqrt(valueInEGLD) * 10;

    return {
      x: index,
      y: valueInEGLD,
      z: bubbleSize,
      sender: tx.sender,
      receiver: tx.receiver
    };
  });
}