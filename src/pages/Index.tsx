
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ERPNextProvider } from '@/contexts/ERPNextContext';

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <ERPNextProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </ERPNextProvider>
    </AuthProvider>
  );
};

export default Index;
