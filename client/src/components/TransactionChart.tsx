import { useState } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';

interface Transaction {
    x: number; // Timestamp en segundos
    y: number;
    z: number;
    sender: string;
    receiver: string;
    type: 'sent' | 'received';
    date: string;
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
                <p>Type: {data.type === 'sent' ? 'Sent' : 'Received'}</p>
                <p>Date: {data.date}</p>
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
    const [timeRange, setTimeRange] = useState([0, 100]); // [inicio, fin] en porcentaje

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
                <p className="text-muted-foreground">
                    No transactions to display
                </p>
            </div>
        );
    }

    const minTimestamp = Math.min(...transactions.map((tx) => tx.x));
    const maxTimestamp = Math.max(...transactions.map((tx) => tx.x));
    const fullRange = maxTimestamp - minTimestamp;

    const domainMin = minTimestamp + (fullRange * timeRange[0]) / 100;
    const domainMax = minTimestamp + (fullRange * timeRange[1]) / 100;

    const visibleSentTransactions = transactions.filter(
        (tx) => tx.type === 'sent' && tx.x >= domainMin && tx.x <= domainMax
    );
    const visibleReceivedTransactions = transactions.filter(
        (tx) => tx.type === 'received' && tx.x >= domainMin && tx.x <= domainMax
    );

    console.log('Time Range (percent):', timeRange);
    console.log('Full Range (seconds):', fullRange);
    console.log('Domain:', [domainMin, domainMax]);
    console.log('Visible Sent Transactions:', visibleSentTransactions.length);
    console.log(
        'Visible Received Transactions:',
        visibleReceivedTransactions.length
    );

    return (
        <div className="h-[500px] w-full space-y-4">
            <h3 className="text-lg font-medium text-center">
                Transaction Amount Distribution
            </h3>
            <p className="text-sm text-muted-foreground text-center">
                Bubble size represents transaction amount
            </p>
            <div className="px-6">
                <label className="text-sm font-medium block mb-2">
                    Time Range:{' '}
                    {format(new Date(domainMin * 1000), 'dd/MM/yyyy')} -{' '}
                    {format(new Date(domainMax * 1000), 'dd/MM/yyyy')}
                </label>
                <Slider
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                />
            </div>
            <ResponsiveContainer height="80%">
                <ScatterChart
                    key={`chart-${timeRange[0]}-${timeRange[1]}`}
                    margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="x"
                        name="Date"
                        type="number"
                        domain={[domainMin, domainMax]}
                        tickFormatter={(timestamp) =>
                            format(new Date(timestamp * 1000), 'dd/MM')
                        } // Formato más corto
                        label={{
                            value: 'Date',
                            position: 'bottom',
                            offset: 40,
                        }}
                        tickCount={6} // Forzar 6 ticks distribuidos uniformemente
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        dataKey="y"
                        name="Amount (EGLD)"
                        type="number"
                        domain={['auto', 'auto']}
                        label={{
                            value: 'Amount (EGLD)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                        }}
                        tickFormatter={(value) => value.toFixed(2)}
                    />
                    <ZAxis dataKey="z" range={[50, 400]} type="number" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        payload={[
                            {
                                value: 'Sent',
                                type: 'circle',
                                color: 'hsl(var(--primary))',
                            },
                            {
                                value: 'Received',
                                type: 'circle',
                                color: 'hsl(var(--secondary))',
                            },
                        ]}
                    />
                    <Scatter
                        name="Sent"
                        data={visibleSentTransactions}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                    />
                    <Scatter
                        name="Received"
                        data={visibleReceivedTransactions}
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.6}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
