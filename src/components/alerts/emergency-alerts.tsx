import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Bell, AlertTriangle, Info } from 'lucide-react';

interface EmergencyAlert {
    id: string;
    type: 'urgent' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: Date;
}

const EmergencyAlerts = () => {
    const alerts: EmergencyAlert[] = [
        {
            id: '1',
            type: 'urgent',
            title: 'Critical Medical Shortage',
            description: 'Al-Shifa Hospital urgently needs surgical supplies and medication',
            timestamp: new Date()
        },
        {
            id: '2',
            type: 'warning',
            title: 'Aid Route Blocked',
            description: 'Rafah crossing temporarily closed - 50 aid trucks delayed',
            timestamp: new Date()
        }
    ];

    const getAlertIcon = (type: EmergencyAlert['type']) => {
        switch (type) {
            case 'urgent':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <Bell className="h-5 w-5 text-yellow-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Emergency Alerts</h3>
            {alerts.map((alert) => (
                <Alert key={alert.id} className={`
                    ${alert.type === 'urgent' ? 'border-red-500 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'}
                `}>
                    <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <AlertTitle>{alert.title}</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                        {alert.description}
                        <div className="text-xs text-gray-500 mt-1">
                            {alert.timestamp.toLocaleTimeString()}
                        </div>
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
};

export default EmergencyAlerts;