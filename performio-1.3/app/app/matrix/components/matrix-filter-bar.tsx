'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function MatrixFilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state from URL params, or default to empty
    const [fromDate, setFromDate] = useState(searchParams.get('from') || '');
    const [toDate, setToDate] = useState(searchParams.get('to') || '');

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (fromDate) params.set('from', fromDate);
        else params.delete('from');

        if (toDate) params.set('to', toDate);
        else params.delete('to');

        // This updates the URL without a hard reload!
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [fromDate, toDate, pathname, searchParams, router]);

    return (
        <div className="flex items-end gap-4 p-4 bg-card border rounded-lg shadow-sm mb-6">
            <div className="space-y-1.5">
                <Label htmlFor="from-date">Start Date</Label>
                <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-[150px]"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="to-date">End Date</Label>
                <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-[150px]"
                />
            </div>

            <Button onClick={applyFilters}>
                Apply Filters
            </Button>
        </div>
    );
}