'use client';

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MatrixData, MatrixMetrics } from "../actions/fetch-matrix-kpis";

export default function MatrixView({ data }: { data: MatrixData }) {
    const [showAll, setShowAll] = useState(false);

    if (!data) return null;

    const renderSummaryBlock = (label: string, metrics: MatrixMetrics) => (
        <div key={label} className="border rounded-md p-4 bg-card shadow-sm space-y-2">
            <h3 className="font-semibold text-sm">{label} Week 1 to 13 Total and Weekly Average</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Total Revenue:</span>
                <span className="font-medium text-right">${metrics.total_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                <span className="text-muted-foreground">Total Appts:</span>
                <span className="font-medium text-right">{metrics.total_appointments}</span>
                <span className="text-muted-foreground">Avg $/Appt:</span>
                <span className="font-medium text-right">${metrics.avg_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                <span className="text-muted-foreground text-destructive">DNAs:</span>
                <span className="font-medium text-right text-destructive">{metrics.dna_count}</span>
                <span className="text-muted-foreground">Cancelled:</span>
                <span className="font-medium text-right">{metrics.cancelled_count}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Hide Historical Data" : "Show All"}
                </Button>
            </div>

            {showAll && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.historicalQuarters.map(q => renderSummaryBlock(q.label, q))}
                </div>
            )}

            <div className="border rounded-lg shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Period</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                            <TableHead className="text-center">Total Appts</TableHead>
                            <TableHead className="text-right">Avg $/Appt</TableHead>
                            <TableHead className="text-center">DNAs</TableHead>
                            <TableHead className="text-center">Cancelled</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.weeklyData.map((row) => (
                            <TableRow key={row.weekIndex}>
                                <TableCell className="font-medium">
                                    {row.label}
                                </TableCell>
                                <TableCell className="text-right">
                                    ${row.total_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-center">
                                    {row.total_appointments}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    ${row.avg_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-center text-destructive">
                                    {row.dna_count}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {row.cancelled_count}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
