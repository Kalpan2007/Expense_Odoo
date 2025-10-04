import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer) {
  const worker = await createWorker('eng');

  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

export function parseExpenseFromText(text) {
  const lines = text.split('\n').filter(line => line.trim());

  const amountRegex = /\$?\d+\.?\d*/g;
  const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;

  const amounts = text.match(amountRegex);
  const dates = text.match(dateRegex);

  let amount = null;
  let date = null;
  let description = '';
  let merchantName = '';

  if (amounts && amounts.length > 0) {
    amount = parseFloat(amounts[amounts.length - 1].replace('$', ''));
  }

  if (dates && dates.length > 0) {
    date = dates[0];
  }

  if (lines.length > 0) {
    merchantName = lines[0].trim();
  }

  description = lines.slice(0, 3).join(' ').substring(0, 100);

  return {
    amount: amount || 0,
    date: date || new Date().toISOString().split('T')[0],
    description: description || 'Scanned receipt',
    merchantName: merchantName || 'Unknown merchant',
    category: categorizeMerchant(merchantName),
    rawText: text
  };
}

function categorizeMerchant(merchantName) {
  const lowerName = merchantName.toLowerCase();

  if (lowerName.includes('restaurant') || lowerName.includes('cafe') ||
      lowerName.includes('food') || lowerName.includes('pizza')) {
    return 'Food & Dining';
  }

  if (lowerName.includes('hotel') || lowerName.includes('inn') ||
      lowerName.includes('lodge')) {
    return 'Lodging';
  }

  if (lowerName.includes('uber') || lowerName.includes('lyft') ||
      lowerName.includes('taxi') || lowerName.includes('transport')) {
    return 'Transportation';
  }

  if (lowerName.includes('office') || lowerName.includes('supply') ||
      lowerName.includes('staples')) {
    return 'Office Supplies';
  }

  return 'Other';
}
