/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { cn } from '@/lib/utils';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';

const AidStatistics = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [loading ,setLoading] = useState(false);

    // Sample data - In a real app, this would come from an API
    const aidDeliveryData = [
        { date: '03/10', trucks: 45, delivered: 35, blocked: 10 },
        { date: '03/11', trucks: 60, delivered: 42, blocked: 18 },
        { date: '03/12', trucks: 55, delivered: 38, blocked: 17 },
        { date: '03/13', trucks: 70, delivered: 50, blocked: 20 },
        { date: '03/14', trucks: 65, delivered: 45, blocked: 20 },
        { date: '03/15', trucks: 80, delivered: 55, blocked: 25 },
        { date: '03/16', trucks: 75, delivered: 52, blocked: 23 },
    ];

    const criticalNeeds = [
        {
            category: "Medical Supplies",
            current: 30,
            required: 100,
            unit: "tons",
            urgency: "critical"
        },
        {
            category: "Food Aid",
            current: 115,
            required: 400,
            unit: "trucks",
            urgency: "high"
        },
        {
            category: "Clean Water",
            current: 25,
            required: 100,
            unit: "million liters",
            urgency: "critical"
        },
        {
            category: "Shelter Capacity",
            current: 60,
            required: 100,
            unit: "thousand spaces",
            urgency: "medium"
        }
    ];

    const regionData = [
        { region: 'Gaza City', aid: 250, population: 600000 },
        { region: 'Khan Yunis', aid: 180, population: 400000 },
        { region: 'Rafah', aid: 220, population: 300000 },
        { region: 'Deir al-Balah', aid: 150, population: 250000 },
        { region: 'North Gaza', aid: 120, population: 350000 },
    ];

    const aidTypeData = [
        { name: 'Food', value: 400, color: '#ff7300' },
        { name: 'Medical', value: 300, color: '#387908' },
        { name: 'Water', value: 300, color: '#00C4FF' },
        { name: 'Shelter', value: 200, color: '#8884d8' },
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <div className="grid gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
                {/* Aid Delivery Trends */}
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Aid Delivery Trends</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={aidDeliveryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="delivered" 
                            stroke="#10b981" 
                                name="Delivered"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="blocked" 
                            stroke="#ef4444" 
                                name="Blocked"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Critical Needs */}
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Critical Needs Status</h3>
                    <div className="space-y-4">
                        {criticalNeeds.map((need) => (
                            <div key={need.category} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{need.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-sm ${
                                    need.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                                    need.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                        {need.urgency}
                                </span>
                                </div>
                                <Progress 
                                    value={(need.current / need.required) * 100}
                                // indicatorClassName={
                                //     need.urgency === 'critical' ? 'bg-red-500' :
                                //     need.urgency === 'high' ? 'bg-orange-500' :
                                //     'bg-yellow-500'
                                // }
                                // className="h-2"
                                    className={cn(
                                        "h-2",
                                        need.urgency === 'critical' ? 'bg-destructive/20' :
                                        need.urgency === 'high' ? 'bg-warning/20' :
                                        'bg-primary/20'
                                    )}
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{need.current} {need.unit}</span>
                                    <span>of {need.required} {need.unit} needed</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Distribution by Region */}
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Aid Distribution by Region</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart 
                                    data={regionData}
                                    onClick={(data) => {
                                        if (data && data.activePayload) {
                                            setSelectedRegion(data.activePayload[0].payload.region);
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="region" 
                                        stroke="currentColor"
                                        fontSize={12}
                                        tickLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis 
                                        stroke="currentColor"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="aid" 
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                        className="cursor-pointer hover:opacity-80"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            {selectedRegion && (
                                <Alert className="mt-2">
                                    <AlertDescription>
                                        {selectedRegion}: {regionData.find(r => r.region === selectedRegion)?.aid} aid units for {regionData.find(r => r.region === selectedRegion)?.population.toLocaleString()} people
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={aidTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                        label={(entry) => entry.name}
                                        labelLine={false}
                                    >
                                        {aidTypeData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color}
                                                className="stroke-background hover:opacity-80"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </div>
    );
};

export default AidStatistics;