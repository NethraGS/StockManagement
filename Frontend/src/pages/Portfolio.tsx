import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import * as Recharts from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Holding = {
  id: string;
  name: string;
  symbol: string;
  qty: number;
  avg: number;
  current: number;
  sector: string;
};

const SAMPLE_HOLDINGS: Holding[] = [
  { id: "1", name: "Tata Consultancy Services", symbol: "TCS", qty: 10, avg: 3200, current: 3450, sector: "IT" },
  { id: "2", name: "Infosys", symbol: "INFY", qty: 15, avg: 1400, current: 1520, sector: "IT" },
  { id: "3", name: "HDFC Bank", symbol: "HDFCBANK", qty: 20, avg: 1400, current: 1480, sector: "Banking" },
  { id: "4", name: "Sun Pharma", symbol: "SUNPHARMA", qty: 50, avg: 750, current: 820, sector: "Pharma" },
  { id: "5", name: "Reliance Industries", symbol: "RELIANCE", qty: 5, avg: 2400, current: 2680, sector: "Energy" },
  { id: "6", name: "Bajaj Finserv", symbol: "BAJFINANCE", qty: 8, avg: 7000, current: 7250, sector: "Financials" },
];

const SAMPLE_TRANSACTIONS = [
  { id: "t1", type: "BUY", symbol: "INFY", qty: 5, price: 1500, date: "2026-02-10", orderId: "ORD123" },
  { id: "t2", type: "SELL", symbol: "HDFCBANK", qty: 2, price: 1400, date: "2026-02-15", orderId: "ORD124" },
  { id: "t3", type: "BUY", symbol: "TCS", qty: 10, price: 3200, date: "2025-12-01", orderId: "ORD125" },
];

const inr = (v: number) => v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function useSortable<T>(items: T[], keyGetter: (t: T) => any) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const copy = [...items];
    copy.sort((a: any, b: any) => {
      const va = keyGetter(a);
      const vb = keyGetter(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") return asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return asc ? va - vb : vb - va;
    });
    return copy;
  }, [items, sortKey, asc, keyGetter]);

  return { sorted, sortKey, asc, setSortKey, setAsc };
}

const Portfolio: React.FC = () => {
  const [query, setQuery] = useState("");
  const [filterSector, setFilterSector] = useState<string | null>(null);
  const holdings = SAMPLE_HOLDINGS;

  const computed = useMemo(() => {
    const rows = holdings.map((h) => {
      const invested = h.qty * h.avg;
      const current = h.qty * h.current;
      const pnl = current - invested;
      const pct = invested === 0 ? 0 : (pnl / invested) * 100;
      return { ...h, invested, current, pnl, pct };
    });

    const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
    const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPct = totalInvested === 0 ? 0 : (totalPnl / totalInvested) * 100;
    const todaysGain = Math.round(rows.reduce((s, r) => s + (r.qty * (r.current - r.avg) * 0.02), 0)); // mock today's gain ~2% of unrealized
    const totalStocks = rows.length;

    const bySector = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.sector] = (acc[r.sector] || 0) + r.current;
      return acc;
    }, {});

    const sectorData = Object.entries(bySector).map(([name, value]) => ({ name, value }));

    return { rows, totalInvested, totalCurrent, totalPnl, totalPct, todaysGain, totalStocks, sectorData };
  }, [holdings]);

  const COLORS = ["#2563eb", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4"];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Portfolio Summary</CardTitle>
                    <CardDescription>Clean overview of your investments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Invested</div>
                    <div className="text-xl font-semibold">{inr(computed.totalInvested)}</div>
                    <div className="text-xs text-muted-foreground">Captured across all holdings</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Current Value</div>
                    <div className="text-xl font-semibold">{inr(computed.totalCurrent)}</div>
                    <div className="text-xs text-muted-foreground">Market value now</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Unrealised P&L</div>
                    <div className={`text-xl font-semibold ${computed.totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {computed.totalPnl >= 0 ? "+" : "-"}{inr(Math.abs(computed.totalPnl))}
                    </div>
                    <div className="text-xs text-muted-foreground">{computed.totalPct.toFixed(2)}% overall</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Today's Change</div>
                    <div className="text-xl font-semibold text-green-600">{computed.todaysGain >= 0 ? "+" : "-"}{inr(Math.abs(computed.todaysGain))}</div>
                    <div className="text-xs text-muted-foreground">Real-time not connected — sample</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex-col sm:flex-row sm:items-center sm:justify-between flex gap-2">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search company or symbol" value={query} onChange={(e:any)=>setQuery(e.target.value)} />
                    <Button onClick={()=>{navigator.clipboard?.writeText('Export not implemented yet')}}>Export</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Holdings: {computed.totalStocks}</div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Allocation</CardTitle>
                <CardDescription>Sector & weight distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="w-full sm:w-1/2 h-44">
                    <ChartContainer id="alloc" config={{ allocation: { color: "#60a5fa" } }}>
                      <Recharts.ResponsiveContainer>
                        <Recharts.PieChart>
                          <Recharts.Pie data={computed.sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({ percent }) => `${Math.round((percent||0)*100)}%`}>
                            {computed.sectorData.map((_,i)=>(<Recharts.Cell key={i} fill={COLORS[i%COLORS.length]}/>))}
                          </Recharts.Pie>
                          <Recharts.Tooltip formatter={(v:number)=>inr(v)} />
                        </Recharts.PieChart>
                      </Recharts.ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <ul className="space-y-2">
                      {computed.sectorData.map((s, i) => (
                        <li key={s.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded" style={{backgroundColor: COLORS[i%COLORS.length]}} />
                            <div className="text-sm">{s.name}</div>
                          </div>
                          <div className="text-sm font-medium">{((s.value/computed.totalCurrent)*100||0).toFixed(1)}%</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Holdings</CardTitle>
                    <CardDescription>Current positions with performance</CardDescription>
                  </div>
                  <div className="hidden sm:block text-sm text-muted-foreground">Updated: sample data</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Avg</TableHead>
                        <TableHead>CMP</TableHead>
                        <TableHead>Invested</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>P&L</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {computed.rows
                        .filter(r => {
                          if (query) {
                            const q = query.toLowerCase();
                            return r.name.toLowerCase().includes(q) || r.symbol.toLowerCase().includes(q);
                          }
                          return true;
                        })
                        .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.sector}</div>
                          </TableCell>
                          <TableCell>{r.symbol}</TableCell>
                          <TableCell>{r.qty}</TableCell>
                          <TableCell>{inr(r.avg)}</TableCell>
                          <TableCell>{inr(r.current / r.qty)}</TableCell>
                          <TableCell>{inr(r.invested)}</TableCell>
                          <TableCell>{inr(r.current)}</TableCell>
                          <TableCell className={r.pnl >= 0 ? "text-green-600" : "text-red-600"}>{r.pnl >= 0 ? "+" : "-"}{inr(Math.abs(r.pnl))}</TableCell>
                          <TableCell>{r.pct.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Latest activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SAMPLE_TRANSACTIONS.map(t => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${t.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>{t.type} {t.symbol}</div>
                        <div className="text-xs text-muted-foreground">{t.qty} @ {inr(t.price)} • {t.date}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.orderId}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  // export transactions as CSV
                  const csv = ['Type,Symbol,Qty,Price,Date,OrderId', ...SAMPLE_TRANSACTIONS.map(t=>`${t.type},${t.symbol},${t.qty},${t.price},${t.date},${t.orderId}`)].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'transactions.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}>Export CSV</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
