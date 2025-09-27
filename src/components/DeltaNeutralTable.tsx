// src/components/DeltaNeutralTable.tsx
import React, { useState } from 'react';
import { useDeltaNeutralOpportunities } from '@/hooks/useDeltaNeutral';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DeltaNeutralTable() {
  const opportunities = useDeltaNeutralOpportunities();

  const [periodHours, setPeriodHours] = useState(8); // default view in 8h

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Opportunités Delta Neutre</CardTitle>
          <div className="flex items-center gap-2">
            <Label>Funding période</Label>
            <Select value={String(periodHours)} onValueChange={(val) => setPeriodHours(Number(val))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1h</SelectItem>
                <SelectItem value="8">8h</SelectItem>
                <SelectItem value="8760">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <p>Aucune paire partagée entre les exchanges sélectionnés.</p>
          ) : (
            <div className="space-y-6">
              {opportunities.map((op) => {
                const longRate = op.bestLong.token.funding_rate * periodHours;
                const shortRate = op.bestShort.token.funding_rate * periodHours;
                const spread = (shortRate - longRate) * 100;

                return (
                  <Card key={op.ticker} className="border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{op.ticker}</h3>
                        <Badge variant="secondary">
                          Spread: {spread.toFixed(2)} %
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:space-x-4 text-sm space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <ArrowUp className="w-4 h-4 text-green-600" />
                          <span>
                            Long sur <strong>{op.bestLong.exchange}</strong> @{' '}
                            {(longRate * 100).toFixed(3)} %
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ArrowDown className="w-4 h-4 text-red-600" />
                          <span>
                            Short sur <strong>{op.bestShort.exchange}</strong> @{' '}
                            {(shortRate * 100).toFixed(3)} %
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exchange</TableHead>
                            <TableHead>Funding Rate</TableHead>
                            <TableHead>Volume 24h</TableHead>
                            <TableHead>Open Interest</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {op.all.map(({ exchange, token }) => (
                            <TableRow key={exchange}>
                              <TableCell>{exchange}</TableCell>
                              <TableCell>
                                {(token.funding_rate * periodHours * 100).toFixed(4)} %
                              </TableCell>
                              <TableCell>
                                {token.volume_24.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {token.open_interest_USD.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
