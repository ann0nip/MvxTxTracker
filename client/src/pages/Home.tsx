import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search } from 'lucide-react';
import TransactionChart from '@/components/TransactionChart';
import { fetchTransactions, fetchTransactionCount } from '@/lib/multiversx';

// Hook simple para debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function Home() {
    const [address, setAddress] = useState('');
    const [txLimit, setTxLimit] = useState(50); // Valor inicial
    const debouncedTxLimit = useDebounce(txLimit, 300);
    const { toast } = useToast();

    // Consulta para el conteo total de transacciones
    const { data: totalTxCount, isFetching: isFetchingCount } = useQuery({
        queryKey: ['transactionCount', address],
        queryFn: () => fetchTransactionCount(address),
        enabled: !!address,
        retry: false,
    });

    // Consulta para las transacciones
    const {
        data: transactions,
        isFetching,
        error,
    } = useQuery({
        queryKey: ['transactions', address, debouncedTxLimit],
        queryFn: () => fetchTransactions(address, debouncedTxLimit),
        enabled: !!address && !!totalTxCount, // Espera a que tengamos el conteo
        retry: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.startsWith('erd1')) {
            toast({
                variant: 'destructive',
                title: 'Invalid address',
                description:
                    "Please enter a valid MultiversX address starting with 'erd1'",
            });
            return;
        }
    };

    // Ajustar txLimit si excede totalTxCount
    useEffect(() => {
        if (totalTxCount && txLimit > totalTxCount) {
            setTxLimit(totalTxCount);
        }
    }, [totalTxCount, txLimit]);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        MultiversX Transaction Visualizer
                    </h1>
                    <p className="text-muted-foreground">
                        Enter a MultiversX address to visualize its transactions
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <Input
                                placeholder="Enter MultiversX address (erd1...)"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={isFetching || isFetchingCount}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {totalTxCount && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">
                                        Number of transactions: {txLimit} (Max:{' '}
                                        {totalTxCount})
                                    </label>
                                </div>
                                <Slider
                                    value={[txLimit]}
                                    onValueChange={(value) =>
                                        setTxLimit(value[0])
                                    }
                                    min={1}
                                    max={totalTxCount} // Máximo dinámico
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        {error ? (
                            <div className="text-center text-destructive py-8">
                                Failed to load transactions. Please try again.
                            </div>
                        ) : (
                            <TransactionChart
                                transactions={transactions || []}
                                isLoading={isFetching}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
