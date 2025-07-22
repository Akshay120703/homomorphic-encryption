import { useState, useEffect } from "react";
import { Lock, Terminal, CheckCircle, Cog } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";

type MessageType = 'A1' | 'A2';

interface EncryptionStatus {
  keyGeneration: 'complete' | 'pending';
  messageEncryption: 'ready' | 'processing' | 'complete';
  transmission: 'waiting' | 'sending' | 'complete';
}

export default function ServerAInterface() {
  const [selectedMessage, setSelectedMessage] = useState<MessageType>('A1');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, level: string}>>([]);
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    keyGeneration: 'complete',
    messageEncryption: 'ready',
    transmission: 'waiting'
  });
  
  const { sendMessage, addMessageHandler } = useWebSocket();

  useEffect(() => {
    // Add initial logs only once
    const initialLogs = [
      { timestamp: new Date().toLocaleTimeString(), message: 'FHE transpiler initialized', level: 'info' },
      { timestamp: new Date().toLocaleTimeString(), message: 'Key generation complete (128-bit security)', level: 'success' },
      { timestamp: new Date().toLocaleTimeString(), message: 'WebSocket connection established', level: 'info' },
      { timestamp: new Date().toLocaleTimeString(), message: 'Waiting for message selection...', level: 'warning' }
    ];
    
    setLogs(prev => prev.length === 0 ? initialLogs : prev);

    const handleMessage = (message: any) => {
      if (message.type === 'log_entry' && message.payload.serverId === 'A') {
        const newLog = {
          timestamp: new Date(message.payload.timestamp).toLocaleTimeString(),
          message: message.payload.message,
          level: message.payload.level
        };
        setLogs(prev => [...prev, newLog].slice(-10)); // Keep last 10 logs
        
        if (message.payload.message.includes('Transmission complete')) {
          setIsEncrypting(false);
          setEncryptionStatus(prev => ({ 
            ...prev, 
            messageEncryption: 'complete',
            transmission: 'complete' 
          }));
        }
      }
    };

    if (addMessageHandler) {
      const removeHandler = addMessageHandler('server-a', handleMessage);
      return removeHandler;
    }
  }, [addMessageHandler]);

  const handleEncryptAndSend = async () => {
    if (isEncrypting) return;

    setIsEncrypting(true);
    setEncryptionStatus(prev => ({ ...prev, messageEncryption: 'processing' }));

    // Send encryption request
    sendMessage({
      type: 'encrypt_message',
      payload: { messageType: selectedMessage }
    });
  };

  const StatusBadge = ({ status, task }: { status: string; task: string }) => {
    const getStatusClass = () => {
      switch (status) {
        case 'complete':
        case 'ready':
          return 'bg-success-green text-white';
        case 'processing':
        case 'sending':
          return 'bg-warning-orange text-white';
        default:
          return 'bg-gray-400 text-white';
      }
    };

    return (
      <span className={`text-xs px-2 py-1 rounded terminal-font ${getStatusClass()}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="bg-security-blue text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Server A - Encryption Server</h2>
              <p className="text-blue-100 text-sm terminal-font">localhost:3000</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation" />
            <span className="text-sm terminal-font">ACTIVE</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Message Input Form */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Message to Encrypt
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setSelectedMessage('A1')}
              className={`message-btn bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group ${selectedMessage === 'A1' ? 'selected' : ''}`}
            >
              <div className="text-center">
                <div className="terminal-font text-lg font-bold security-blue">A1</div>
                <div className="text-xs text-gray-500 mt-1">Message Type A1</div>
              </div>
              {selectedMessage === 'A1' && (
                <div className="mt-2">
                  <CheckCircle className="w-4 h-4 text-success-green mx-auto" />
                </div>
              )}
            </button>
            <button
              onClick={() => setSelectedMessage('A2')}
              className={`message-btn bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group ${selectedMessage === 'A2' ? 'selected' : ''}`}
            >
              <div className="text-center">
                <div className="terminal-font text-lg font-bold security-blue">A2</div>
                <div className="text-xs text-gray-500 mt-1">Message Type A2</div>
              </div>
              {selectedMessage === 'A2' && (
                <div className="mt-2">
                  <CheckCircle className="w-4 h-4 text-success-green mx-auto" />
                </div>
              )}
            </button>
          </div>

          <Button 
            onClick={handleEncryptAndSend}
            disabled={isEncrypting}
            className="w-full bg-security-blue hover:bg-blue-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isEncrypting ? 'Encrypting...' : 'Encrypt & Send Message'}
          </Button>
        </div>

        {/* Encryption Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Cog className="w-4 h-4 mr-2" />
            FHE Encryption Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Key Generation</span>
              <StatusBadge status={encryptionStatus.keyGeneration} task="Key Generation" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Message Encryption</span>
              <StatusBadge status={encryptionStatus.messageEncryption} task="Message Encryption" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transmission</span>
              <StatusBadge status={encryptionStatus.transmission} task="Transmission" />
            </div>
          </div>
        </div>

        {/* Server A Logs */}
        <div className="bg-black text-green-400 rounded-lg p-4 terminal-font text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">Server A Logs</span>
            <Terminal className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                <span className={`log-level-${log.level}`}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}