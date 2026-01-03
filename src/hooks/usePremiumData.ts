import { useState, useEffect } from 'react';
import { read, utils } from 'xlsx';

export interface PremiumDataRow {
  // We'll define the exact structure after analyzing the Excel file
  [key: string]: string | number | null;
}

export interface PremiumData {
  sheets: string[];
  data: Record<string, PremiumDataRow[]>;
  headers: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

export function usePremiumData() {
  const [premiumData, setPremiumData] = useState<PremiumData>({
    sheets: [],
    data: {},
    headers: {},
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/gesamtbericht_ch.xlsx');
        if (!response.ok) {
          throw new Error('Failed to fetch Excel file');
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        
        const sheetNames = workbook.SheetNames;
        const data: Record<string, PremiumDataRow[]> = {};
        const headers: Record<string, string[]> = {};
        
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json<PremiumDataRow>(worksheet, { defval: null });
          const headerRow = utils.sheet_to_json<string[]>(worksheet, { header: 1 })[0] || [];
          
          data[sheetName] = jsonData;
          headers[sheetName] = headerRow;
        });
        
        // Log structure for debugging
        console.log('Excel Structure:', {
          sheets: sheetNames,
          headers,
          sampleData: Object.fromEntries(
            Object.entries(data).map(([sheet, rows]) => [sheet, rows.slice(0, 3)])
          ),
        });
        
        setPremiumData({
          sheets: sheetNames,
          data,
          headers,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading premium data:', error);
        setPremiumData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    loadData();
  }, []);

  return premiumData;
}
