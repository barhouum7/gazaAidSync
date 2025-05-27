import { cn } from '@/lib/utils';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { AlertTriangle } from 'lucide-react';

interface NeedCategory {
    category: string;
    currentLevel: number;
    criticalThreshold: number;
    unit: string;
    affectedPopulation: number;
}

const NeedsAssessment = () => {
    const needs: NeedCategory[] = [
        {
            category: "Food Security",
            currentLevel: 20,
            criticalThreshold: 60,
            unit: "% of population",
            affectedPopulation: 470000
        },
        {
            category: "Medical Supplies",
            currentLevel: 30,
            criticalThreshold: 75,
            unit: "% of demand",
            affectedPopulation: 350000
        },
        {
            category: "Clean Water",
            currentLevel: 15,
            criticalThreshold: 50,
            unit: "% of requirement",
            affectedPopulation: 520000
        }
    ];

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-4">Critical Needs Assessment</h3>
            <div className="space-y-6">
                {needs.map((need) => (
                    <div key={need.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{need.category}</span>
                            {need.currentLevel < need.criticalThreshold && (
                                <div className="flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Critical</span>
                                </div>
                            )}
                        </div>
                        <Progress 
                            value={need.currentLevel} 
                            // indicatorClassName={
                            //     need.currentLevel < need.criticalThreshold
                            //         ? "bg-red-500"
                            //         : "bg-green-500"
                            // }
                            // className="h-2"
                            className={cn(
                                "h-2",
                                need.currentLevel < need.criticalThreshold ? "bg-red-500" : "bg-green-500"
                            )}
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Current: {need.currentLevel}%</span>
                            <span>Affected: {need.affectedPopulation.toLocaleString()} people</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default NeedsAssessment;