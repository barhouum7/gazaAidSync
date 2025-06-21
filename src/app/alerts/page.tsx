import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const mockAlerts = [
    {
        type: 'Medical',
        message: 'Urgent need for blood donations at Gaza Central Hospital.',
        timestamp: '2024-06-20 14:30',
    },
    {
        type: 'Food',
        message: 'Food supplies running low in Deir al-Balah. Immediate aid required.',
        timestamp: '2024-06-20 09:15',
    },
    {
        type: 'Security',
        message: 'Increased security risk reported near Rafah border crossing.',
        timestamp: '2024-06-19 21:00',
    },
];

export default function AlertsPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold mb-4">Alerts</h1>
            <div className="space-y-4">
                {mockAlerts.map((alert, idx) => (
                    <Alert key={idx}>
                        <AlertTitle>
                            <Badge variant="outline" className="mr-2">{alert.type}</Badge>
                            {alert.message}
                        </AlertTitle>
                        <AlertDescription>
                            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </AlertDescription>
                    </Alert>
                ))}
            </div>
        </div>
    );
} 