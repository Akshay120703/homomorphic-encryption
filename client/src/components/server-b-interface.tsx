import { useState, useEffect } from "react";
import { Cpu, Terminal, Brain, BarChart3, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

interface ProcessingStatus {
  messageReceived: 'waiting' | 'received';
  circuitEvaluation: 'pending' | 'processing' | 'complete';
  resultComputation: 'pending' | 'complete';
}

export default function ServerBInterface() {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    messageReceived: 'waiting',
    circuitEvaluation: 'pending', 
    resultComputation: 'pending'
  });
  const [result, setResult] = useState<string>('No Message Received');
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, level: string}>>([]);
  const [processingTimeMs, setProcessingTimeMs] = useState<number>(0);
  
  const { addMessageHandler } = useWebSocket();

  useEffect(() => {
    // Add initial logs
    const initialLogs = [
      { timestamp: new Date().toLocaleTimeString(), message: 'FHE processing server initialized', level: 'info' },
      { timestamp: new Date().toLocaleTimeString(), message: 'TFHE backend loaded successfully', level: 'success' },
      { timestamp: new Date().toLocaleTimeString(), message: 'Circuit evaluation engine ready', level: 'info' },
      { timestamp: new Date().toLocaleTimeString(), message: 'Listening for encrypted messages...', level: 'warning' }
    ];
    setLogs(initialLogs);

    const removeHandler = addMessageHandler('server-b', (message) => {
      if (message.type === 'log_entry' && message.payload.serverId === 'B') {
        const newLog = {
          timestamp: new Date(message.payload.timestamp).toLocaleTimeString(),
          message: message.payload.message,
          level: message.payload.level
        };
        setLogs(prev => [...prev, newLog].slice(-10)); // Keep last 10 logs
      } else if (message.type === 'encrypted_message') {
        setProcessingStatus(prev => ({ ...prev, messageReceived: 'received', circuitEvaluation: 'processing' }));
      } else if (message.type === 'processing_result') {
        setResult(message.payload.result ? 'True' : 'False');
        setProcessingTimeMs(message.payload.processingTimeMs);
        setProcessingStatus({
          messageReceived: 'received',
          circuitEvaluation: 'complete',
          resultComputation: 'complete'
        });
      }
    });

    return removeHandler;
  }, [addMessageHandler]);

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusClass = () => {
      switch (status) {
        case 'received':
        case 'complete':
          return 'bg-success-green text-white';
        case 'processing':
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

  const getResultColor = () => {
    if (result === 'True') return 'text-success-green';
    if (result === 'False') return 'text-warning-orange';
    return 'text-gray-400';
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="bg-encryption-green text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cpu className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Server B - Processing Server</h2>
              <p className="text-green-100 text-sm terminal-font">localhost:5000</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation" />
            <span className="text-sm terminal-font">LISTENING</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Message Processing Status */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            Homomorphic Processing Status
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Encrypted Message Received</span>
                <StatusBadge status={processingStatus.messageReceived} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FHE Circuit Evaluation</span>
                <StatusBadge status={processingStatus.circuitEvaluation} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Result Computation</span>
                <StatusBadge status={processingStatus.resultComputation} />
              </div>
            </div>
          </div>
        </div>

        {/* Processing Results */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Identification Results
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className={`text-2xl terminal-font font-bold ${getResultColor()}`}>
                  {result}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {result === 'No Message Received' 
                    ? 'Awaiting encrypted message from Server A'
                    : `Processing completed in ${processingTimeMs}ms`
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
            <Info className="w-4 h-4 mr-2 text-warning-orange inline" />
            <strong>FHE Process:</strong> Server B can identify message content (A1→True, A2→False) without ever decrypting the data
          </div>
        </div>

        {/* Server B Logs */}
        <div className="bg-black text-green-400 rounded-lg p-4 terminal-font text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">Server B Logs</span>
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