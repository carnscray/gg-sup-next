import { fetchLocations } from "@/app/app/(reference)/actions/fetch-location";
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
    const { success, data: locations, error } = await fetchLocations();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Locations</h2>
            <p className="text-muted-foreground">Physical clinics and business entities.</p>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    {error && (
                        <div className="text-destructive mb-4 font-medium">
                            Error loading locations: {error}
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Cliniko ID</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {success && locations?.map((loc) => (
                                <TableRow key={loc.id}>
                                    <TableCell>{loc.loc_name}</TableCell>
                                    <TableCell>{loc.loc_city || '-'}</TableCell>
                                    <TableCell>{loc.loc_state || '-'}</TableCell>
                                    <TableCell>{loc.id}</TableCell>
                                    <TableCell>
                                        {loc.loc_is_active ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Archived</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {success && locations?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No locations found. Run sync script to populate data.
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