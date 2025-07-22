import { useState, useEffect } from "react";
import { Server, Wifi, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

interface ServerStatusData {
  serverA: { status: string; port: number };
  serverB: { status: string; port: number };
  messagesProcessed: number;
  latency: number;
}

export default function SystemStatus() {
  const { isConnected, addMessageHandler } = useWebSocket();
  const [status, setStatus] = useState<ServerStatusData>({
    serverA: { status: 'online', port: 3000 },
    serverB: { status: 'online', port: 5000 },
    messagesProcessed: 0,
    latency: 12
  });

  useEffect(() => {
    const removeHandler = addMessageHandler('system-status', (message) => {
      if (message.type === 'processing_result') {
        setStatus(prev => ({
          ...prev,
          messagesProcessed: prev.messagesProcessed + 1
        }));
      }
    });

    return removeHandler;
  }, [addMessageHandler]);

  const StatusCard = ({ 
    title, 
    value, 
    icon: Icon, 
    iconColor, 
    subtitle 
  }: {
    title: string;
    value: string;
    icon: any;
    iconColor: string;
    subtitle: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${value === 'Online' || value === 'Connected' ? 'text-success-green' : 'text-gray-900'}`}>
              {value}
            </p>
          </div>
          <div className={`${iconColor} rounded-full p-3`}>
            <Icon className={`w-6 h-6 ${iconColor.replace('bg-', 'text-').replace('/10', '')}`} />
          </div>
        </div>
        <p className="text-xs text-gray-500 terminal-font mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatusCard
        title="Server A Status"
        value={status.serverA.status === 'online' ? 'Online' : 'Offline'}
        icon={Server}
        iconColor="bg-success-green/10"
        subtitle={`Port: ${status.serverA.port}`}
      />
      
      <StatusCard
        title="Server B Status"
        value={status.serverB.status === 'online' ? 'Online' : 'Offline'}
        icon={Server}
        iconColor="bg-success-green/10"
        subtitle={`Port: ${status.serverB.port}`}
      />
      
      <StatusCard
        title="WebSocket Connection"
        value={isConnected ? 'Connected' : 'Disconnected'}
        icon={Wifi}
        iconColor="bg-success-green/10"
        subtitle={`Latency: ${status.latency}ms`}
      />
      
      <StatusCard
        title="Messages Processed"
        value={status.messagesProcessed.toString()}
        icon={MessageCircle}
        iconColor="bg-security-blue/10"
        subtitle="Success Rate: 100%"
      />
    </div>
  );
}