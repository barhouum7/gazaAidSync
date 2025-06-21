import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockUpdates = [
    {
        title: 'Aid Convoy Arrives in Gaza',
        date: '2024-06-20',
        description: 'A new convoy with food and medical supplies has arrived and is being distributed in northern Gaza.'
    },
    {
        title: 'Water Distribution Restored',
        date: '2024-06-19',
        description: 'Water trucks have resumed service in several neighborhoods after repairs to damaged infrastructure.'
    },
    {
        title: 'New Medical Center Opens',
        date: '2024-06-18',
        description: 'A temporary medical center has opened in Rafah to provide urgent care.'
    },
];

export default function UpdatesPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold mb-4">Updates</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockUpdates.map((update, idx) => (
                    <Card key={idx}>
                        <CardHeader>
                            <CardTitle>{update.title}</CardTitle>
                            <div className="text-xs text-muted-foreground">{update.date}</div>
                        </CardHeader>
                        <CardContent>
                            <p>{update.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 