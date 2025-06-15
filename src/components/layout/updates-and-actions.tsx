"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LiveUpdatesFeed from "@/components/updates/live-updates-feed";
import EmergencyAlerts from "@/components/alerts/emergency-alerts";
import { Button } from "@/components/ui/button";
import AidStatistics from "../dashboard/aid-statistics";

export default function UpdatesAndActions() {
    return (
        <div className="flex flex-col gap-8">
            <Tabs defaultValue="updates" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="updates" className="flex-1">Updates</TabsTrigger>
                    <TabsTrigger value="alerts" className="flex-1">Alerts</TabsTrigger>
                </TabsList>
                {/* <TabsContent value="stats">
                        <AidStatistics />
                    </TabsContent> */}
                <TabsContent value="updates" className="mt-4">
                    <Card className="p-4 shadow-md border border-muted">
                        <LiveUpdatesFeed />
                    </Card>
                </TabsContent>
                <TabsContent value="alerts" className="mt-4">
                    <Card className="p-4 shadow-md border border-muted">
                        <EmergencyAlerts />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}