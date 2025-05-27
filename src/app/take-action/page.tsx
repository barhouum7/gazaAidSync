'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TakeAction() {
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
                        <form className="space-y-4">
                            <Input placeholder="Enter your location" />
                            <Button className="w-full">Find Representatives</Button>
                            
                            <Textarea 
                                className="h-32"
                                placeholder="Customize your message..."
                                defaultValue={`I am writing to express my deep concern about the humanitarian crisis in Gaza...`}
                            />
                            <Button className="w-full">Send Message</Button>
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
                            <Button className="w-full" variant="outline">
                                Share Latest Statistics
                            </Button>
                            <Button className="w-full" variant="outline">
                                Share Emergency Alerts
                            </Button>
                            <Button className="w-full" variant="outline">
                                Share Aid Delivery Updates
                            </Button>
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
                        <Button variant="link" className="text-left">
                            Understanding the Crisis
                        </Button>
                        <Button variant="link" className="text-left">
                            Aid Distribution Process
                        </Button>
                        <Button variant="link" className="text-left">
                            How to Help Effectively
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}