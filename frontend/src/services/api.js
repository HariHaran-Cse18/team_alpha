const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('medora_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(err.detail || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demoLogin: () => request('/auth/demo-login', { method: 'POST' }),
  getProfile: () => request('/auth/me'),

  // Inventory
  getInventory: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category && params.category !== 'All') qs.append('category', params.category);
    if (params.criticality && params.criticality !== 'All') qs.append('criticality', params.criticality);
    if (params.risk && params.risk !== 'All') qs.append('risk', params.risk);
    if (params.search) qs.append('search', params.search);
    return request(`/inventory?${qs.toString()}`);
  },
  getMedicine: (id) => request(`/inventory/${id}`),
  createMedicine: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicine: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),

  // Forecast
  getForecast: (medicineId, horizon = 14) => request(`/forecast/${medicineId}?horizon=${horizon}`),
  getForecastSummaries: () => request('/forecast'),

  // Risk Intelligence
  getRisks: () => request('/risks'),
  getMedicineRisk: (medicineId) => request(`/risks/${medicineId}`),

  // Procurement
  getRecommendations: () => request('/procurement/recommendations'),
  getPurchaseOrders: (status = 'All') => request(`/procurement/orders?status=${status}`),
  createPurchaseOrder: (data) => request('/procurement/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/procurement/orders/${id}/status?status=${status}`, { method: 'PUT' }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  getSupplierDetails: (id) => request(`/suppliers/${id}`),

  // Expiry
  getExpiryTimeline: () => request('/expiry/timeline'),

  // Simulation
  runWhatIf: (data) => request('/simulation/what-if', { method: 'POST', body: JSON.stringify(data) }),
  tickSimulation: () => request('/simulation/tick', { method: 'POST' }),

  // Alerts
  getAlerts: (severity = 'All') => request(`/alerts?severity=${severity}`),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: 'PUT' }),
  markAllAlertsRead: () => request('/alerts/mark-all-read', { method: 'PUT' }),
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: 'PUT' }),

  // Analytics & KPIs
  getDashboardKPIs: () => request('/analytics/dashboard'),
  getAnalyticsTrends: () => request('/analytics/trends'),

  // Demo Reset
  resetDemoData: () => request('/demo/reset', { method: 'POST' })
};
