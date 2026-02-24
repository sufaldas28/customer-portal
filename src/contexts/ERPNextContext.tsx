import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ERPNextSettings {
  customer_id: string;
  customer_name: string;
  is_connected: boolean;
  last_sync_at: string | null;
}

interface ERPNextContextType {
  settings: ERPNextSettings | null;
  isConfigured: boolean;
  refreshSettings: () => Promise<void>;
}

const ERPNextContext = createContext<ERPNextContextType>({
  settings: null,
  isConfigured: false,
  refreshSettings: async () => {},
});

export const useERPNextSettings = () => useContext(ERPNextContext);

export const ERPNextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ERPNextSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      return;
    }
    const { data } = await supabase
      .from('erpnext_settings')
      .select('customer_id, customer_name, is_connected, last_sync_at')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setSettings(data);
    }
  }, [user]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const isConfigured = !!(settings?.is_connected && settings?.customer_id);

  return (
    <ERPNextContext.Provider value={{ settings, isConfigured, refreshSettings }}>
      {children}
    </ERPNextContext.Provider>
  );
};
