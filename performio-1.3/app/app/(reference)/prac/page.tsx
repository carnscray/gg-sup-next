import { fetchPractitioners } from "@/app/app/(reference)/actions/fetch-prac";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function LocationPage() {
    const { success, data: practitioners, error } = await fetchPractitioners();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Practitioners</h2>
            <p className="text-muted-foreground">Practitioner directory across all locations.</p>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    {error && (
                        <div className="text-destructive mb-4 font-medium">
                            Error loading practitioners: {error}
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Cliniko ID</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {success && practitioners?.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.prac_firstname}</TableCell>
                                    <TableCell>{p.prac_lastname}</TableCell>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>
                                        {p.prac_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {success && practitioners?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No practitioners found. Run sync script to populate data.
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