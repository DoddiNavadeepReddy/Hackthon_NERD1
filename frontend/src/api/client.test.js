import { describe, it, expect } from 'vitest';
import {
  CLASS_DISPLAY_ORDER,
  CLASS_COLORS,
  normalizeConfusionMatrix,
  formatContribution,
  ApiError,
  getShapImageUrl,
} from './client.js';

describe('API Client & Contract Rules', () => {
  it('defines the standard class display order according to contract', () => {
    expect(CLASS_DISPLAY_ORDER).toEqual(['normal', 'DoS', 'Probe', 'R2L', 'U2R']);
    expect(CLASS_COLORS.normal).toBe('#7C7F86');
    expect(CLASS_COLORS.DoS).toBe('#E03434');
    expect(CLASS_COLORS.Probe).toBe('#E9A02A');
    expect(CLASS_COLORS.R2L).toBe('#8B45E8');
    expect(CLASS_COLORS.U2R).toBe('#F2761C');
  });

  describe('normalizeConfusionMatrix', () => {
    it('correctly row-normalizes raw count matrix into [0, 1] percentages', () => {
      const rawMatrix = [
        [90, 10, 0, 0, 0],
        [5, 45, 0, 0, 0],
      ];
      const { normalized, raw } = normalizeConfusionMatrix(rawMatrix);
      expect(raw).toBe(rawMatrix);
      expect(normalized[0][0]).toBeCloseTo(0.9, 5);
      expect(normalized[0][1]).toBeCloseTo(0.1, 5);
      expect(normalized[1][0]).toBeCloseTo(0.1, 5);
      expect(normalized[1][1]).toBeCloseTo(0.9, 5);
    });

    it('guards against rows summing to zero without crashing or NaN', () => {
      const zeroRowMatrix = [
        [0, 0, 0, 0, 0],
        [10, 0, 0, 0, 0],
      ];
      const { normalized } = normalizeConfusionMatrix(zeroRowMatrix);
      expect(normalized[0]).toEqual([0, 0, 0, 0, 0]);
      expect(normalized[1][0]).toBe(1);
    });
  });

  describe('formatContribution', () => {
    it('labels positive log-odds as pushes toward target class', () => {
      const result = formatContribution(2.45, 'normal');
      expect(result.direction).toBe('pushes toward');
      expect(result.label).toBe('pushes toward normal');
      expect(result.rawMargin).toBe(2.45);
      expect(result.absMargin).toBe(2.45);
    });

    it('labels negative log-odds as pushes away from target class without percentage', () => {
      const result = formatContribution(-1.816, 'DoS');
      expect(result.direction).toBe('pushes away from');
      expect(result.label).toBe('pushes away from DoS');
      expect(result.rawMargin).toBe(-1.816);
      expect(result.absMargin).toBe(1.816);
      expect(result.label).not.toContain('%');
    });
  });

  describe('ApiError handling', () => {
    it('maps 422 array of detail objects into fieldErrors map', () => {
      const details = [
        { field: 'duration', message: 'Missing feature' },
        { field: 'src_bytes', message: 'Must be non-negative' },
      ];
      const err = new ApiError('Validation error', 422, details);
      expect(err.status).toBe(422);
      expect(err.fieldErrors.duration).toBe('Missing feature');
      expect(err.fieldErrors.src_bytes).toBe('Must be non-negative');
    });

    it('handles 413 upload size limit error', () => {
      const err = new ApiError('CSV file exceeds the 5MB limit', 413);
      expect(err.status).toBe(413);
      expect(err.message).toBe('CSV file exceeds the 5MB limit');
    });
  });

  describe('getShapImageUrl', () => {
    it('generates correct clean URL for static SHAP images', () => {
      const url = getShapImageUrl('exports/shap/final_xgboost_overall.png');
      expect(url).toContain('/static/shap/final_xgboost_overall.png');
    });
  });
});
