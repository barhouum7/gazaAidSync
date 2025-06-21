import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockStats = {
    totalAidDelivered: '1,250 Tons',
    numberOfAlerts: 17,
    recentActivity: [
        { type: 'Aid Delivered', detail: '200 food packages delivered to Khan Younis', date: '2024-06-20' },
        { type: 'Alert', detail: 'Medical supplies needed in Rafah', date: '2024-06-19' },
        { type: 'Update', detail: 'New shelter opened in Gaza City', date: '2024-06-18' },
    ],
};

export default function DashboardPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Aid Delivered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.totalAidDelivered}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Number of Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.numberOfAlerts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {mockStats.recentActivity.map((item, idx) => (
                                <li key={idx} className="text-sm">
                                    <span className="font-semibold">{item.type}:</span> {item.detail}
                                    <span className="block text-xs text-muted-foreground">{item.date}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 