import { useState, useEffect } from "react";
import { ArrowRight, Server, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

export default function TransmissionMonitor() {
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [stats, setStats] = useState({
    messagesSent: 0,
    avgProcessingTime: 0,
    successRate: 100,
    securityLevel: '2048bit'
  });

  const { addMessageHandler } = useWebSocket();

  useEffect(() => {
    const removeHandler = addMessageHandler('transmission-monitor', (message) => {
      if (message.type === 'encrypted_message') {
        setIsTransmitting(true);
        // Animate transmission
        setTransmissionProgress(0);
        const interval = setInterval(() => {
          setTransmissionProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsTransmitting(false);
                setTransmissionProgress(0);
              }, 1000);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      } else if (message.type === 'processing_result') {
        setStats(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
          avgProcessingTime: Math.round((prev.avgProcessingTime + message.payload.processingTimeMs) / 2)
        }));
      }
    });

    return removeHandler;
  }, [addMessageHandler]);

  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <ArrowRight className="w-5 h-5 mr-2 security-blue" />
          Real-time Transmission Monitor
        </h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-6 relative">
          {/* Server A */}
          <div className="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-w-32">
            <div className="w-12 h-12 bg-security-blue rounded-full flex items-center justify-center mb-2">
              <Server className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Server A</span>
            <span className="text-xs text-gray-500 terminal-font">Encrypt</span>
          </div>

          {/* Transmission Arrow */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-full h-1 bg-gray-300 rounded-full relative">
              <div 
                className="absolute left-0 top-0 h-full bg-encryption-green rounded-full transition-all duration-1000 transmission-bar" 
                style={{ width: `${transmissionProgress}%` }}
              />
            </div>
            <ArrowRight className={`text-encryption-green text-xl mx-4 ${isTransmitting ? 'animate-pulse' : ''}`} />
          </div>

          {/* Server B */}
          <div className="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-w-32">
            <div className="w-12 h-12 bg-encryption-green rounded-full flex items-center justify-center mb-2">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Server B</span>
            <span className="text-xs text-gray-500 terminal-font">Process</span>
          </div>
        </div>

        {/* Transmission Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold security-blue terminal-font">{stats.messagesSent}</div>
            <div className="text-xs text-gray-600">Messages Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold encryption-green terminal-font">{stats.avgProcessingTime}ms</div>
            <div className="text-xs text-gray-600">Avg Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold success-green terminal-font">{stats.successRate}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold warning-orange terminal-font">{stats.securityLevel}</div>
            <div className="text-xs text-gray-600">Security Level</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}