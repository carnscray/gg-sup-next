import { fetchAppTypes } from "@/app/app/(reference)/actions/fetch-apptype";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export default async function AppTypePage() {
    const { success, data: appTypes, error } = await fetchAppTypes();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Appointment Types</h2>
            <p className="text-muted-foreground">Service definitions and group class settings.</p>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    {error && (
                        <div className="text-destructive mb-4 font-medium">
                            Error loading appointment types: {error}
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Appointment Name</TableHead>
                                <TableHead>Max Attendees</TableHead>
                                <TableHead>Cliniko ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {success && appTypes?.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>{a.apptype_name}</TableCell>
                                    <TableCell>{a.apptype_max_attendees || 'N/A'}</TableCell>
                                    <TableCell>{a.id}</TableCell>
                                </TableRow>
                            ))}

                            {success && appTypes?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        No appointment types found. Run sync script to populate data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}