import type { HealthRecord, RecordFilter } from '~/types/record';

const API_BASE = '/api/records';

export async function fetchRecords(filter?: RecordFilter, userId?: string): Promise<HealthRecord[]> {
  const params = new URLSearchParams();

  if (userId) params.append('userId', userId);
  if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
  if (filter?.dateTo) params.append('dateTo', filter.dateTo);
  if (filter?.category) params.append('category', filter.category);

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

export async function deleteAllRecords(userId: string): Promise<{ deletedCount: number }> {
  const response = await fetch(`${API_BASE}?deleteAll=true&userId=${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete all records');
  }
  return response.json();
}

export interface HealthAnalysis {
  analysis: string;
  recommendations: string[];
  error?: string;
}

export interface AnalysisOptions {
  startFrom?: 'beginning' | 'lastAnalysis' | 'custom';
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export async function analyzeHealth(userId: string, options?: AnalysisOptions): Promise<HealthAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      startFrom: options?.startFrom,
      startDate: options?.startDate,
      endDate: options?.endDate,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze health data');
  }
  return response.json();
}

// Analysis history types and functions
export interface AnalysisHistoryItem {
  sessionId: string;
  createdAt: string;
  analysis: HealthAnalysis | null;
}

export async function fetchAnalysisHistory(userId: string): Promise<AnalysisHistoryItem[]> {
  // Fetch analysis sessions (sessions starting with 'health-analysis-')
  const response = await fetch(`/api/chat-history?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analysis history');
  }

  const sessions = await response.json();

  // Filter only analysis sessions
  const analysisSessions = sessions.filter(
    (s: { sessionId: string }) => s.sessionId && s.sessionId.startsWith('health-analysis-'),
  );

  return analysisSessions.map((s: { sessionId: string; createdAt: string }) => ({
    sessionId: s.sessionId,
    createdAt: s.createdAt,
    analysis: null, // Will be loaded on demand
  }));
}

export async function fetchAnalysisSession(sessionId: string): Promise<HealthAnalysis | null> {
  const response = await fetch(`/api/chat-history?sessionId=${sessionId}`);
  if (!response.ok) {
    return null;
  }

  const messages = await response.json();

  // Find the AI response which contains the analysis JSON
  const aiMessage = messages.find((m: { role: string }) => m.role === 'assistant');
  if (!aiMessage) return null;

  try {
    // Try to parse the AI response as JSON
    const text = aiMessage.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: parsed.analysis || '',
        recommendations: parsed.recommendations || [],
      };
    }
  } catch {
    // If parsing fails, return the raw text as analysis
    return {
      analysis: aiMessage.text,
      recommendations: [],
    };
  }

  return null;
}
