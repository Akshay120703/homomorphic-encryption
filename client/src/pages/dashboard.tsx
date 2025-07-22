import { useEffect } from "react";
import { Shield, Settings, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import SystemStatus from "../components/system-status";
import ServerAInterface from "../components/server-a-interface";
import ServerBInterface from "../components/server-b-interface";
import TransmissionMonitor from "../components/transmission-monitor";
import FHEInfoPanels from "../components/fhe-info-panels";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const { isConnected } = useWebSocket();

  useEffect(() => {
    document.title = "FHE Secure Communication System";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-security-blue rounded-lg p-2">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  FHE Secure Communication System
                </h1>
                <p className="text-gray-600 text-sm">
                  Fully Homomorphic Encryption Demonstration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-green animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm terminal-font text-gray-600">
                  {isConnected ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <Button className="bg-security-blue hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Status Overview */}
        <SystemStatus />

        {/* Server Interfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ServerAInterface />
          <ServerBInterface />
        </div>

        {/* Transmission Visualization */}
        <TransmissionMonitor />

        {/* FHE Technical Information */}
        <FHEInfoPanels />
      </div>
    </div>
  );
}
