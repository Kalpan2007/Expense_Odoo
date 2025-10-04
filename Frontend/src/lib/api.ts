const API_BASE_URL = 'http://localhost:5000/api';

function getAuthToken(): string | null {
  const session = localStorage.getItem('session');
  if (session) {
    const parsedSession = JSON.parse(session);
    return parsedSession.access_token;
  }
  return null;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      
      // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid session data
        localStorage.removeItem('session');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

export const authAPI = {
  signup: async (email: string, password: string, fullName: string, country: string, currency: string) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, country, currency }),
    });
  },

  login: async (email: string, password: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return fetchAPI('/auth/me');
  },
};

export const userAPI = {
  getAll: async () => {
    return fetchAPI('/users');
  },

  create: async (userData: any) => {
    return fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, updates: any) => {
    return fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const expenseAPI = {
  getAll: async () => {
    return fetchAPI('/expenses');
  },

  create: async (expenseData: any) => {
    return fetchAPI('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  update: async (id: string, updates: any) => {
    return fetchAPI(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return fetchAPI(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  scanReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/scan-receipt`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        
        if (response.status === 401) {
          localStorage.removeItem('session');
          localStorage.removeItem('user');
          localStorage.removeItem('company');
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(errorData.error || 'Scan failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during receipt scan.');
    }
  },
};

export const approvalAPI = {
  getWorkflows: async (expenseId?: string) => {
    const query = expenseId ? `?expenseId=${expenseId}` : '';
    return fetchAPI(`/approvals/workflows${query}`);
  },

  approve: async (expenseId: string, comments?: string) => {
    return fetchAPI(`/approvals/expenses/${expenseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  reject: async (expenseId: string, comments?: string) => {
    return fetchAPI(`/approvals/expenses/${expenseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  getRules: async () => {
    return fetchAPI('/approvals/rules');
  },

  createRule: async (ruleData: any) => {
    return fetchAPI('/approvals/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  },

  updateRule: async (id: string, updates: any) => {
    return fetchAPI(`/approvals/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteRule: async (id: string) => {
    return fetchAPI(`/approvals/rules/${id}`, {
      method: 'DELETE',
    });
  },
};

export const currencyAPI = {
  getExchangeRates: async (baseCurrency: string) => {
    return fetchAPI(`/currency/exchange-rates?baseCurrency=${baseCurrency}`);
  },

  getCountries: async () => {
    return fetchAPI('/currency/countries');
  },
};