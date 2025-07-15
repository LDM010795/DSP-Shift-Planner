/**
 * Token Receiver Component - Shift-Planner
 * 
 * Empfängt und verarbeitet Authentication Tokens von MP-Portal.
 * Ermöglicht nahtloses Single Sign-On zwischen DSP Frontends.
 * 
 * Features:
 * - Token-Extraktion aus URL-Parametern
 * - Automatische User-Authentifizierung
 * - Sichere Token-Speicherung
 * - Error Handling und Fallback
 * 
 * Author: DSP Development Team
 * Created: 12.07.2025
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface TokenReceiverProps {
  onTokenReceived?: (token: string, userInfo: any) => void;
  onError?: (error: string) => void;
}

interface TokenValidationResponse {
  valid: boolean;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  employee_info?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department: {
      id: number;
      name: string;
    };
    position: {
      id: number;
      title: string;
    };
  };
  error?: string;
}

const TokenReceiver: React.FC<TokenReceiverProps> = ({ 
  onTokenReceived, 
  onError 
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Token wird verarbeitet...');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    processUrlToken();
  }, []);

  /**
   * Verarbeitet MP-Portal Token aus URL-Parametern
   */
  const processUrlToken = async (): Promise<void> => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const mpToken = urlParams.get('mp_token');
      const source = urlParams.get('source');

      // Validiere dass Token von MP-Portal kommt
      if (!mpToken || source !== 'mp-portal') {
        throw new Error('Kein gültiger MP-Portal Token gefunden');
      }

      // Entferne Token aus URL aus Sicherheitsgründen
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Validiere Token mit Backend
      await validateToken(mpToken);

    } catch (err) {
      console.error('Token processing failed:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Token-Verarbeitung fehlgeschlagen');
      
      if (onError) {
        onError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  /**
   * Validiert Token mit Backend und extrahiert User-Info
   */
  const validateToken = async (token: string): Promise<void> => {
    try {
      setMessage('Token wird validiert...');

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      
      // Sende Token an Backend zur Validierung
      const response = await fetch(`${backendUrl}/api/auth/validate-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: TokenValidationResponse = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Token-Validierung fehlgeschlagen');
      }

      // Speichere validierte Daten
      localStorage.setItem('shift_planner_access_token', token);
      localStorage.setItem('shift_planner_user', JSON.stringify(data.user));
      localStorage.setItem('shift_planner_employee', JSON.stringify(data.employee_info));

      setUserInfo(data.user);
      setStatus('success');
      setMessage('Erfolgreich authentifiziert!');

      // Callback für Parent-Komponente
      if (onTokenReceived) {
        onTokenReceived(token, data.user);
      }

      // Auto-redirect nach kurzer Delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      console.error('Token validation failed:', err);
      throw err;
    }
  };

  /**
   * Zurück zu MP-Portal
   */
  const handleBackToPortal = (): void => {
    const portalUrl = 'http://localhost:5173'; // MP-Portal URL
    window.location.href = portalUrl;
  };

  /**
   * Retry Token-Verarbeitung
   */
  const handleRetry = (): void => {
    setStatus('processing');
    setIsProcessing(true);
    processUrlToken();
  };

  /**
   * Rendert Status-Icon
   */
  const renderStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-16 h-16 border-4 border-dsp-orange/30 border-t-dsp-orange rounded-full animate-spin" />
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsp-gray-50 via-white to-dsp-orange_light flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-dsp-orange opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-dsp-blue opacity-5 rounded-full blur-3xl" />
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="card card-elevated p-8 text-center">
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            {renderStatusIcon()}
          </motion.div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-dsp-gray-900 mb-2">
            DSP Shift Planner
          </h1>
          
          {/* Status Message */}
          <p className="text-dsp-gray-600 mb-6">
            {message}
          </p>

          {/* User Info (bei Erfolg) */}
          {status === 'success' && userInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Angemeldet als
                </span>
              </div>
              <p className="text-green-700 font-semibold">
                {userInfo.first_name} {userInfo.last_name}
              </p>
              <p className="text-green-600 text-sm">
                {userInfo.email}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'error' && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full btn btn-primary"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={handleBackToPortal}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Zurück zum Portal
                </button>
              </>
            )}

            {status === 'success' && (
              <div className="text-sm text-dsp-gray-500">
                Sie werden automatisch weitergeleitet...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dsp-gray-200">
            <p className="text-xs text-dsp-gray-500">
              Sichere Authentifizierung über MP-Portal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenReceiver; 