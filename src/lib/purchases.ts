import { Capacitor } from '@capacitor/core';
import type { PurchasesPackage, PurchasesOffering } from '@revenuecat/purchases-typescript-internal-esm';

async function getPurchases() {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  return Purchases;
}

function describePurchasesError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === 'object' && error !== null) {
    return error;
  }
  return { message: String(error) };
}

// Module-level init promise — getOfferings/isExplorer await this so they
// never call RevenueCat before configure() has finished
let _initPromise: Promise<void> = Promise.resolve();

export function initPurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();

  _initPromise = (async () => {
    const Purchases = await getPurchases();
    const iosKey = (import.meta as any).env?.VITE_REVENUECAT_IOS_KEY as string | undefined;
    const androidKey = (import.meta as any).env?.VITE_REVENUECAT_ANDROID_KEY as string | undefined;
    const apiKey = (Capacitor.getPlatform() === 'ios' ? iosKey : androidKey) ?? '';
    if (!apiKey) {
      console.warn(`[purchases] missing RevenueCat API key for ${Capacitor.getPlatform()}`);
      return;
    }
    await Purchases.configure({ apiKey });
  })().catch(err => console.warn('[purchases] init failed:', describePurchasesError(err)));

  return _initPromise;
}

// Wait for init, but cap the wait so callers never hang indefinitely
function waitForInit(ms = 6000): Promise<void> {
  return Promise.race([
    _initPromise,
    new Promise<void>(resolve => setTimeout(resolve, ms)),
  ]);
}

export async function isExplorer(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await waitForInit();
    const Purchases = await getPurchases();
    const timeout = new Promise<boolean>(resolve => setTimeout(() => resolve(false), 3000));
    const check = Purchases.getCustomerInfo().then(
      ({ customerInfo }) => customerInfo.entitlements.active['Noctua Pro'] !== undefined
    ).catch(() => false);
    return await Promise.race([check, timeout]);
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    await waitForInit();
    const Purchases = await getPurchases();
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('getOfferings timeout')), 8000)
    );
    const offerings = await Promise.race([Purchases.getOfferings(), timeout]);
    const current = offerings.current;

    if (!current) {
      console.warn('[purchases] RevenueCat returned no current offering', {
        offeringIds: Object.keys(offerings.all ?? {}),
      });
    } else if (!current.availablePackages?.length) {
      console.warn('[purchases] RevenueCat current offering has no available packages', {
        currentOfferingId: current.identifier,
        offeringIds: Object.keys(offerings.all ?? {}),
      });
    } else {
      console.info('[purchases] RevenueCat offering loaded', {
        currentOfferingId: current.identifier,
        packages: current.availablePackages.map(pkg => ({
          packageId: pkg.identifier,
          packageType: pkg.packageType,
          productId: pkg.product.identifier,
        })),
      });
    }

    return current;
  } catch (err) {
    console.warn('[purchases] getOfferings failed:', describePurchasesError(err));
    return null;
  }
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
