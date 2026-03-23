import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PractitionerKPIs } from "../actions/fetch-matrix-kpis";

export default function MatrixTable({ data }: { data: PractitionerKPIs[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground mt-6">
                Please select a date range to view practitioner metrics.
            </div>
        );
    }

    return (
        <div className="border rounded-lg shadow-sm bg-card mt-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Practitioner</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-center">Total Appts</TableHead>
                        <TableHead className="text-right">Avg $/Appt</TableHead>
                        <TableHead className="text-center">DNAs</TableHead>
                        <TableHead className="text-center">Cancelled</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.prac_id}>
                            <TableCell>
                                {row.prac_name}
                            </TableCell>
                            <TableCell className="text-right">
                                ${row.total_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-center">
                                {row.total_appointments}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                ${row.avg_revenue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    );
}