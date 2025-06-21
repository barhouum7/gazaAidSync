'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MOCK_REPRESENTATIVES: { name: string; contact: string }[] = [
    { name: 'Rep. A', contact: 'rep.a@email.com' },
    { name: 'Rep. B', contact: 'rep.b@email.com' },
];

export default function TakeAction() {
    const [location, setLocation] = useState('');
    const [representatives, setRepresentatives] = useState<{ name: string; contact: string }[]>([]);
    const [message, setMessage] = useState('I am writing to express my deep concern about the humanitarian crisis in Gaza...');
    const [loadingReps, setLoadingReps] = useState(false);

    const handleFindReps = (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingReps(true);
        // Simulate API call
        setTimeout(() => {
            setRepresentatives(MOCK_REPRESENTATIVES);
            setLoadingReps(false);
        }, 1000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        window.alert('Your message has been sent to your representatives!');
    };

    const handleShare = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                window.alert('Copied to clipboard!');
            });
        } else {
            window.alert('Clipboard API not supported.');
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold">Take Action for Gaza</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Representatives */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Representatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleFindReps}>
                            <Input
                                placeholder="Enter your location"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                            <Button className="w-full" type="submit" disabled={loadingReps}>
                                {loadingReps ? 'Finding...' : 'Find Representatives'}
                            </Button>
                        </form>
                        {representatives.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="font-semibold">Your Representatives:</div>
                                {representatives.map((rep, idx) => (
                                    <div key={idx} className="border rounded p-2">
                                        <div>{rep.name}</div>
                                        <div className="text-xs text-muted-foreground">{rep.contact}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <form className="space-y-4 mt-6" onSubmit={handleSendMessage}>
                            <Textarea
                                className="h-32"
                                placeholder="Customize your message..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                            <Button className="w-full" type="submit">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Share Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Share Critical Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button className="w-full" variant="outline" onClick={() => handleShare('Latest statistics about Gaza: ...')}>Share Latest Statistics</Button>
                            <Button className="w-full" variant="outline" onClick={() => handleShare('Emergency alerts for Gaza: ...')}>Share Emergency Alerts</Button>
                            <Button className="w-full" variant="outline" onClick={() => handleShare('Aid delivery updates for Gaza: ...')}>Share Aid Delivery Updates</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Educational Resources */}
            <Card>
                <CardHeader>
                    <CardTitle>Learn More</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="link" className="text-left" asChild>
                            <a href="https://www.un.org/unispal/history2/origins-and-evolution-of-the-palestine-problem/" target="_blank" rel="noopener noreferrer">Understanding the Crisis</a>
                        </Button>
                        <Button variant="link" className="text-left" asChild>
                            <a href="https://www.humanitarianresponse.info/en/operations/occupied-palestinian-territory/gaza-strip" target="_blank" rel="noopener noreferrer">Aid Distribution Process</a>
                        </Button>
                        <Button variant="link" className="text-left" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">How to Help Effectively</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}