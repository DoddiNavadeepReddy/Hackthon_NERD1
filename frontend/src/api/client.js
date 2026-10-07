/**
 * NERD API Client
 * Generated strictly against docs/api-contract.md
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Standard display order for attack classes across all NERD UI views.
 * Rule: Define the display order once in the client.
 */
export const CLASS_DISPLAY_ORDER = ['normal', 'DoS', 'Probe', 'R2L', 'U2R'];

/**
 * Visual design system colors for classes (strictly matching design rules)
 */
export const CLASS_COLORS = {
  normal: '#7C7F86', // Slate Gray
  DoS: '#E03434',    // Bright Red
  Probe: '#E9A02A',  // Amber
  R2L: '#8B45E8',    // Purple
  U2R: '#F2761C',    // Orange
};

export const CLASS_DESCRIPTIONS = {
  normal: 'Normal legitimate network traffic',
  DoS: 'Denial of Service (flooding target to disrupt service)',
  Probe: 'Surveillance & probing (scanning ports, vulnerability mapping)',
  R2L: 'Remote-to-Local (unauthorized remote access / exploits)',
  U2R: 'User-to-Root (unauthorized local superuser privilege escalation)',
};

/**
 * Normalizes confusion matrix raw count rows to percentages [0, 1].
 * Guards against rows summing to zero.
 * 
 * @param {number[][]} matrix - 2D raw counts array
 * @returns {{ normalized: number[][], raw: number[][] }}
 */
export function normalizeConfusionMatrix(matrix) {
  if (!matrix || !Array.isArray(matrix)) return { normalized: [], raw: [] };
  const normalized = matrix.map(row => {
    const sum = row.reduce((acc, val) => acc + val, 0);
    if (sum === 0) return row.map(() => 0);
    return row.map(val => val / sum);
  });
  return { normalized, raw: matrix };
}

/**
 * Formats XGBoost log-odds contribution according to contract rules:
 * Rule: label them "pushes toward / away from <contribution_class>", never percent.
 */
export function formatContribution(contributionValue, contributionClass) {
  const isToward = contributionValue >= 0;
  return {
    isToward,
    direction: isToward ? 'pushes toward' : 'pushes away from',
    label: `${isToward ? 'pushes toward' : 'pushes away from'} ${contributionClass}`,
    rawMargin: contributionValue,
    absMargin: Math.abs(contributionValue),
  };
}

/**
 * Custom Error wrapper capturing 422 detail fields, 413, and status codes
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.fieldErrors = {};
    if (Array.isArray(details)) {
      details.forEach(item => {
        if (item && item.field) {
          this.fieldErrors[item.field] = item.message || 'Invalid value';
        }
      });
    }
  }
}

/**
 * Internal fetch helper with JSON and error parsing
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new ApiError(`Network unreachable: ${err.message}`, 0);
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // not JSON
    }

    if (response.status === 422) {
      const details = errorData?.detail || [];
      const msg = Array.isArray(details)
        ? details.map(d => `${d.field}: ${d.message}`).join(', ')
        : 'Validation failed';
      throw new ApiError(msg, 422, details);
    }

    if (response.status === 413) {
      const msg = typeof errorData?.detail === 'string'
        ? errorData.detail
        : 'File size exceeds maximum upload limit';
      throw new ApiError(msg, 413, errorData?.detail);
    }

    const message = errorData?.detail || `HTTP Error ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  return response.json();
}

/**
 * Health check endpoint
 * GET /health
 */
export async function getHealth() {
  return apiFetch('/health');
}

/**
 * Retries /health with backoff to handle Render free-tier cold starts.
 * Calls onRetry({ attempt, maxRetries, delayMs }) on each cycle.
 */
export async function waitForServer(onRetry = null, maxRetries = 15, baseDelay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const health = await getHealth();
      if (health && health.status === 'ok') {
        return health;
      }
    } catch (err) {
      if (attempt === maxRetries) {
        throw new ApiError('Server failed to wake up within timeout limit', 504);
      }
      const delayMs = Math.min(baseDelay * Math.pow(1.2, attempt - 1), 6000);
      if (typeof onRetry === 'function') {
        onRetry({ attempt, maxRetries, delayMs, error: err.message });
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

/**
 * Model info endpoint
 * GET /model-info
 */
export async function getModelInfo() {
  return apiFetch('/model-info');
}

/**
 * Schema endpoint
 * GET /schema
 */
export async function getSchema() {
  return apiFetch('/schema');
}

/**
 * Samples endpoint
 * GET /samples?category={category}&limit={limit}
 */
export async function getSamples(category = 'normal', limit = 1) {
  const query = new URLSearchParams();
  if (category) query.append('category', category);
  if (limit) query.append('limit', String(limit));
  return apiFetch(`/samples?${query.toString()}`);
}

/**
 * Metrics endpoint
 * GET /metrics
 */
export async function getMetrics() {
  return apiFetch('/metrics');
}

/**
 * Live single prediction
 * POST /predict?detail=full
 * 
 * Supports either flat 41 features object or { features: { ... } }
 */
export async function predict(featureData, detail = 'full') {
  const raw = featureData && featureData.features ? featureData.features : (featureData || {});
  const cleaned = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k !== 'label' && k !== 'category' && k !== 'difficulty' && k !== 'id') {
      cleaned[k] = v;
    }
  }
  const payload = { features: cleaned };
  const query = detail ? `?detail=${encodeURIComponent(detail)}` : '';
  return apiFetch(`/predict${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Batch prediction via CSV file
 * POST /predict/batch
 */
export async function predictBatch(file) {
  if (file.size > 5 * 1024 * 1024) {
    throw new ApiError('CSV file exceeds the 5MB limit', 413);
  }

  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/predict/batch`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new ApiError(`Network unreachable: ${err.message}`, 0);
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {}

    if (response.status === 413) {
      throw new ApiError(errorData?.detail || 'CSV file exceeds the 5MB limit', 413);
    }
    throw new ApiError(errorData?.detail || `HTTP Error ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Returns full URL for exported SHAP plot
 * GET /static/shap/{file}
 */
export function getShapImageUrl(filename) {
  const cleanName = filename.replace(/^exports\/shap\//, '').replace(/^\/static\/shap\//, '');
  return `${API_BASE_URL}/static/shap/${cleanName}`;
}
