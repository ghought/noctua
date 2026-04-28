import { Capacitor } from '@capacitor/core';
import type { PurchasesPackage, PurchasesOffering } from '@revenuecat/purchases-typescript-internal-esm';

async function getPurchases() {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  return Purchases;
}

export async function initPurchases() {
  if (!Capacitor.isNativePlatform()) return;

  const Purchases = await getPurchases();

  const iosKey = (import.meta as any).env?.VITE_REVENUECAT_IOS_KEY as string | undefined;
  const androidKey = (import.meta as any).env?.VITE_REVENUECAT_ANDROID_KEY as string | undefined;

  const apiKey = (Capacitor.getPlatform() === 'ios' ? iosKey : androidKey) ?? '';
  if (!apiKey) return;

  await Purchases.configure({ apiKey });
}

export async function isExplorer(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['Noctua Pro'] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!Capacitor.isNativePlatform()) return null;

  const Purchases = await getPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(aPackage: PurchasesPackage): Promise<{ success: boolean; cancelled?: boolean }> {
  const Purchases = await getPurchases();
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage });
    return { success: customerInfo.entitlements.active['Noctua Pro'] !== undefined };
  } catch (e: any) {
    if (e.userCancelled) return { success: false, cancelled: true };
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['Noctua Pro'] !== undefined;
}
