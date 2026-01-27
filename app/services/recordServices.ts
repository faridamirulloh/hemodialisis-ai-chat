import type { HealthRecord, RecordFilter } from '~/types/record';

const API_BASE = '/api/records';

export async function fetchRecords(filter?: RecordFilter, userId?: string): Promise<HealthRecord[]> {
  const params = new URLSearchParams();

  if (userId) params.append('userId', userId);
  if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
  if (filter?.dateTo) params.append('dateTo', filter.dateTo);
  if (filter?.category) params.append('category', filter.category);
  if (filter?.severity) params.append('severity', filter.severity);
  if (filter?.searchTerm) params.append('search', filter.searchTerm);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch records');
  }
  return response.json();
}

export async function getRecordById(id: string): Promise<HealthRecord> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch record');
  }
  return response.json();
}

export async function createRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create record');
  }
  return response.json();
}

export async function updateRecord(id: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update record');
  }
  return response.json();
}

export async function deleteRecord(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete record');
  }
}

export interface HealthAnalysis {
  analysis: string;
  recommendations: string[];
  error?: string;
}

export async function analyzeHealth(userId: string): Promise<HealthAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze health data');
  }
  return response.json();
}
