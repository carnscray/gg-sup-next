'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface FilterOptions {
    practitioners: { id: string; name: string }[];
    locations: { id: string; name: string }[];
}

export default function MatrixFilterBar({ options }: { options: FilterOptions }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedWeek = searchParams.get('week') || '18'; // Default to week 18 as per current date in 2026
    const selectedPrac = searchParams.get('prac') || 'all';
    const selectedLoc = searchParams.get('loc') || 'all';
    const selectedFreq = searchParams.get('freq') || 'selected';

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, searchParams, router]);

    // Generate 30 weeks from Mon Jan 5, 2026
    const weekOptions = Array.from({ length: 30 }, (_, i) => {
        const weekNum = i + 1;
        const startDate = new Date('2026-01-05T00:00:00+11:00');
        startDate.setDate(startDate.getDate() + i * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const format = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        return {
            value: weekNum.toString(),
            label: `${weekNum} - ${format(startDate)} - ${format(endDate)}`
        };
    });

    return (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-card border rounded-lg shadow-sm mb-6">
            <div className="space-y-1.5">
                <Label>Range</Label>
                <Select value={selectedWeek} onValueChange={(v) => updateFilter('week', v)}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                        {weekOptions.map((w) => (
                            <SelectItem key={w.value} value={w.value}>
                                {w.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label>Practitioner</Label>
                <Select value={selectedPrac} onValueChange={(v) => updateFilter('prac', v)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Practitioners" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Practitioners</SelectItem>
                        {options.practitioners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label>Locations</Label>
                <Select value={selectedLoc} onValueChange={(v) => updateFilter('loc', v)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {options.locations.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                                {l.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={selectedFreq} onValueChange={(v) => updateFilter('freq', v)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Selected" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
