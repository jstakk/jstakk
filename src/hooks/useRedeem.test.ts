import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useRedeem } from './useRedeem';

describe('useRedeem hook', () => {
  // Mock localStorage
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with mock initial coins and transactions', () => {
    const { result } = renderHook(() => useRedeem());
    expect(result.current.redeemableCoins).toBe(5000);
    expect(result.current.transactions.length).toBe(3);
  });

  it('should successfully redeem cash', () => {
    const { result } = renderHook(() => useRedeem());

    act(() => {
      const redeemResult = result.current.redeem(100, '1234', 'redeemCash');
      expect(redeemResult.success).toBe(true);
    });

    expect(result.current.redeemableCoins).toBe(4900);
    expect(result.current.transactions.length).toBe(4);
    expect(result.current.transactions[0].type).toBe('redeemCash');
    expect(result.current.transactions[0].amount).toBe(-100);
  });

  it('should fail redemption with wrong PIN', () => {
    const { result } = renderHook(() => useRedeem());

    let redeemResult;
    act(() => {
        redeemResult = result.current.redeem(100, '0000', 'redeemCash');
    });

    expect(redeemResult.success).toBe(false);
    expect(redeemResult.message).toBe('Feil PIN-kode.');
    expect(result.current.redeemableCoins).toBe(5000); // Unchanged
    expect(result.current.transactions.length).toBe(3); // Unchanged
  });

  it('should fail redemption if amount is greater than balance', () => {
    const { result } = renderHook(() => useRedeem());

    let redeemResult;
    act(() => {
        redeemResult = result.current.redeem(6000, '1234', 'redeemCash');
    });

    expect(redeemResult.success).toBe(false);
    expect(redeemResult.message).toBe('Ikke nok mynter.');
  });

  it('should fail redemption if amount is less than 50', () => {
    const { result } = renderHook(() => useRedeem());

    let redeemResult;
    act(() => {
        redeemResult = result.current.redeem(40, '1234', 'redeemCash');
    });

    expect(redeemResult.success).toBe(false);
    expect(redeemResult.message).toBe('Minimumsbeløp er 50 mynter.');
  });

  it('should correctly add a gift card redemption transaction', () => {
    const { result } = renderHook(() => useRedeem());

    act(() => {
      result.current.redeem(200, '1234', 'redeemGift', 'Amazon');
    });

    expect(result.current.redeemableCoins).toBe(4800);
    expect(result.current.transactions[0].type).toBe('redeemGift');
    expect(result.current.transactions[0].note).toBe('Amazon-kort');
    expect(result.current.transactions[0].amount).toBe(-200);
  });
});
