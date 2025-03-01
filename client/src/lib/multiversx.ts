import axios from "axios";

import { format } from "date-fns";

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
  type: "sent" | "received";
  date: string; // Fecha legible
}

export async function fetchTransactions(address: string, limit: number = 50): Promise<ProcessedTransaction[]> {
  if (!address) return [];

  try {
    const response = await axios.get(`https://api.multiversx.com/accounts/${address}/transactions`, {
      params: {
        size: limit,
      },
    });

    console.log("API Response:", response.data);
    return processTransactions(response.data, address);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function fetchTransactionCount(address: string): Promise<number> {
  if (!address) return 0;

  try {
    const response = await axios.get(`https://api.multiversx.com/accounts/${address}/transactions/count`, {
      headers: {
        Accept: "application/json",
      },
    });
    const count = Number(response.data);
    console.log("Total Transaction Count (sent + received):", count);
    return count;
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    throw new Error("Failed to fetch transaction count");
  }
}

function processTransactions(transactions: RawTransaction[], address: string): ProcessedTransaction[] {
  return transactions.map((tx) => {
    const valueInEGLD = Number(tx.value) / Math.pow(10, 18);
    const bubbleSize = Math.sqrt(valueInEGLD) * 10;

    const type = tx.sender === address ? "sent" : "received";
    const date = format(new Date(tx.timestamp * 1000), "dd/MM/yyyy HH:mm:ss");

    return {
      x: tx.timestamp, // Usamos el timestamp directamente
      y: valueInEGLD,
      z: bubbleSize,
      sender: tx.sender,
      receiver: tx.receiver,
      type,
      date,
    };
  });
}