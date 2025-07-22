import { useState, useEffect } from "react";
import { Key, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface FHEKeyInfo {
  publicKeySize: number;
  privateKeySize: number;
  evalKeySize: number;
  securityLevel: number;
  scheme: string;
}

export default function FHEInfoPanels() {
  const { data: fheInfo, isLoading } = useQuery<FHEKeyInfo>({
    queryKey: ['/api/fhe-info'],
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const securityFeatures = [
    { 
      icon: CheckCircle,
      title: 'End-to-End Privacy', 
      description: 'Data never decrypted during processing' 
    },
    { 
      icon: CheckCircle,
      title: 'Quantum Resistant', 
      description: 'Based on lattice-based cryptography' 
    },
    { 
      icon: CheckCircle,
      title: 'Zero Trust Architecture', 
      description: 'Server B operates without data access' 
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2 security-blue" />
            FHE Implementation Details
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">FHE Library</span>
                <span className="text-sm terminal-font bg-gray-100 px-2 py-1 rounded">
                  {fheInfo?.scheme || 'Google TFHE'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Security Level</span>
                <span className="text-sm terminal-font bg-gray-100 px-2 py-1 rounded">
                  {fheInfo?.securityLevel || 128}-bit
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Circuit Type</span>
                <span className="text-sm terminal-font bg-gray-100 px-2 py-1 rounded">
                  Boolean
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Public Key Size</span>
                <span className="text-sm terminal-font bg-gray-100 px-2 py-1 rounded">
                  {fheInfo?.publicKeySize || 2048} bits
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Evaluation Key Size</span>
                <span className="text-sm terminal-font bg-gray-100 px-2 py-1 rounded">
                  {fheInfo?.evalKeySize || 4096} bits
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 encryption-green" />
            Security & Privacy
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <feature.icon className="w-5 h-5 success-green mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}