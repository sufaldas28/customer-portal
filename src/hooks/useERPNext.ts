import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ERPNextResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  not_configured?: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function useERPNext() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callERPNext = useCallback(async <T = any>(body: Record<string, any>): Promise<ERPNextResponse<T>> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('erpnext-proxy', {
        body
      });

      if (fnError) {
        const errMsg = fnError.message || 'Failed to connect to ERPNext';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (!data?.success) {
        const errMsg = data?.error || 'Unknown error from ERPNext';
        setError(errMsg);
        return { success: false, error: errMsg, not_configured: data?.not_configured };
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      const errMsg = err.message || 'Network error';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getList = useCallback(async <T = any>(
    doctype: string,
    options?: {
      fields?: string[];
      filters?: any[];
      order_by?: string;
      limit_page_length?: number;
      limit_start?: number;
    }
  ): Promise<ERPNextResponse<T[]>> => {
    return callERPNext<T[]>({
      action: 'get_list',
      doctype,
      ...options
    });
  }, [callERPNext]);

  const getDoc = useCallback(async <T = any>(
    doctype: string,
    name: string,
    fields?: string[]
  ): Promise<ERPNextResponse<T>> => {
    return callERPNext<T>({
      action: 'get_doc',
      doctype,
      name,
      fields
    });
  }, [callERPNext]);

  const getCount = useCallback(async (
    doctype: string,
    filters?: any[]
  ): Promise<ERPNextResponse<number>> => {
    return callERPNext<number>({
      action: 'get_count',
      doctype,
      filters
    });
  }, [callERPNext]);

  const getDashboardData = useCallback(async (filters?: any[]): Promise<ERPNextResponse<any>> => {
    return callERPNext({
      action: 'get_dashboard_data',
      filters
    });
  }, [callERPNext]);

  const testConnection = useCallback(async (): Promise<ERPNextResponse<any>> => {
    return callERPNext({
      action: 'test_connection'
    });
  }, [callERPNext]);

  const runMethod = useCallback(async <T = any>(
    method_name: string,
    args?: Record<string, any>
  ): Promise<ERPNextResponse<T>> => {
    return callERPNext<T>({
      action: 'run_method',
      method_name,
      args
    });
  }, [callERPNext]);

  return {
    loading,
    error,
    setError,
    callERPNext,
    getList,
    getDoc,
    getCount,
    getDashboardData,
    testConnection,
    runMethod
  };
}

// Helper to format ERPNext currency
export const formatPGK = (amount: number): string => {
  return new Intl.NumberFormat('en-PG', {
    style: 'currency',
    currency: 'PGK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper to format ERPNext date
export const formatERPDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PG', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Map ERPNext status to our StatusBadge statuses
export const mapOrderStatus = (status: string): string => {
  const map: Record<string, string> = {
    'Draft': 'Pending',
    'To Deliver and Bill': 'Processing',
    'To Bill': 'Shipped',
    'To Deliver': 'Confirmed',
    'Completed': 'Delivered',
    'Cancelled': 'Cancelled',
    'Closed': 'Delivered',
    'On Hold': 'Pending',
    'Overdue': 'Overdue',
  };
  return map[status] || status;
};

export const mapInvoiceStatus = (status: string, outstanding: number): string => {
  if (status === 'Cancelled') return 'Cancelled';
  if (outstanding <= 0) return 'Paid';
  if (status === 'Overdue') return 'Overdue';
  if (outstanding > 0 && status === 'Partly Paid') return 'Partially Paid';
  return 'Unpaid';
};

export const mapPaymentStatus = (status: string, docstatus: number): string => {
  if (docstatus === 0) return 'Pending';
  if (docstatus === 2) return 'Failed';
  if (status === 'Cancelled') return 'Failed';
  return 'Completed';
};
