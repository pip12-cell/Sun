import { storageService } from './storageService';

/**
 * Downloads a file to the user's browser
 */
function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export complete database as JSON backup
 */
export async function exportBackupJSON(dumpData?: any): Promise<void> {
  const dump = dumpData || (await storageService.getAllDataDump());
  const jsonString = JSON.stringify(dump, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  triggerFileDownload(jsonString, `sun-beauty-backup-${dateStr}.json`, 'application/json');
}

export const exportDatabaseAsJson = exportBackupJSON;

/**
 * Generate TypeScript code string for initialData.ts
 */
export function generateInitialDataFileContent(dump: any): string {
  return `import { Category, Coupon, DatabaseMeta, Product, Review, StoreSettings } from '../types';

export const DATA_VERSION = ${dump.meta?.version || 1};

export const INITIAL_DATABASE_META: DatabaseMeta = ${JSON.stringify(dump.meta || { version: 1, initialized: true, updatedAt: new Date().toISOString() }, null, 2)};

export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(dump.categories || [], null, 2)};

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(dump.products || [], null, 2)};

export const INITIAL_REVIEWS: Review[] = ${JSON.stringify(dump.reviews || [], null, 2)};

export const INITIAL_COUPONS: Coupon[] = ${JSON.stringify(dump.coupons || [], null, 2)};

export const INITIAL_SETTINGS: StoreSettings = ${JSON.stringify(dump.settings || {}, null, 2)};
`;
}

/**
 * Reads and parses backup JSON file
 */
export async function parseBackupFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.products || !parsed.settings) {
          throw new Error('الملف لا يحتوي على هيكل بيانات متجر Sun Beauty الصحيح.');
        }
        resolve(parsed);
      } catch (err: any) {
        reject(new Error(err.message || 'فشل قراءة ملف النسخة الاحتياطية.'));
      }
    };
    reader.onerror = () => reject(new Error('خطأ أثناء قراءة الملف.'));
    reader.readAsText(file);
  });
}

/**
 * Export current IndexedDB live data as a valid TypeScript file `initialData.ts`
 */
export async function exportInitialDataTS(): Promise<void> {
  const dump = await storageService.getAllDataDump();

  const tsContent = `import { Category, Coupon, DatabaseMeta, Product, Review, StoreSettings } from '../types';

export const DATA_VERSION = ${dump.meta.version || 1};

export const INITIAL_DATABASE_META: DatabaseMeta = ${JSON.stringify(dump.meta, null, 2)};

export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(dump.categories, null, 2)};

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(dump.products, null, 2)};

export const INITIAL_REVIEWS: Review[] = ${JSON.stringify(dump.reviews, null, 2)};

export const INITIAL_COUPONS: Coupon[] = ${JSON.stringify(dump.coupons, null, 2)};

export const INITIAL_SETTINGS: StoreSettings = ${JSON.stringify(dump.settings, null, 2)};
`;

  triggerFileDownload(tsContent, 'initialData.ts', 'text/typescript');
}
