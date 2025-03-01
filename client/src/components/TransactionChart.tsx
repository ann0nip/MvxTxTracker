import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card } from "@/components/ui/card";

interface Transaction {
  x: number;
  y: number;
  z: number;
  sender: string;
  receiver: string;
}

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <Card className="p-3 bg-popover text-popover-foreground">
      <div className="space-y-1 text-sm">
        <p className="font-medium">Transaction Details</p>
        <p>Amount: {data.y.toFixed(4)} EGLD</p>
        <p className="text-xs text-muted-foreground truncate">
          From: {data.sender}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          To: {data.receiver}
        </p>
      </div>
    </Card>
  );
};

export default function TransactionChart({ transactions, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No transactions to display</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
          <XAxis 
            dataKey="x" 
            name="Index" 
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => Math.floor(value).toString()}
          />
          <YAxis 
            dataKey="y" 
            name="Amount (EGLD)" 
            type="number"
            domain={['auto', 'auto']}
          />
          <ZAxis 
            dataKey="z" 
            range={[50, 400]} 
            type="number"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={transactions}
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
