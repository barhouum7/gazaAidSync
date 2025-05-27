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
    ResponsiveContainer
} from 'recharts';

const AidStatistics = () => {
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
                            <div className="flex justify-between">
                                <span className="font-medium">{need.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-sm ${
                                    need.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                                    need.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
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
                                    need.urgency === 'critical' ? 'bg-red-500' :
                                    need.urgency === 'high' ? 'bg-orange-500' :
                                    'bg-yellow-500'
                                )}
                            />
                            <div className="flex justify-between text-sm text-gray-500">
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
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                        { region: 'Gaza City', aid: 250 },
                        { region: 'Khan Yunis', aid: 180 },
                        { region: 'Rafah', aid: 220 },
                        { region: 'Deir al-Balah', aid: 150 },
                        { region: 'North Gaza', aid: 120 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="aid" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default AidStatistics;