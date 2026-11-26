import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, LineCapStyle } from 'pdf-lib';

export interface ExecutiveReportTableItem {
  id: string;
  dateFormatted: string;
  customerName: string;
  customerWhatsapp: string;
  productName: string;
  imageUrl?: string;
  quantity: number;
  staffName: string;
  status: 'pending' | 'called' | 'no deal' | 'sold';
  amount: number;
}

export interface ReportStaffPerformance {
  staffName: string;
  quotesCount: number;
  closedDealsCount: number;
  revenue: number;
}

export interface ExecutiveReportPayload {
  fromDateFormatted: string;
  toDateFormatted: string;
  generatedAtFormatted: string;
  ownerName: string;
  totalRevenue: number;
  totalVisitors: number;
  quotesCount: number;
  closedDealsCount: number;
  piecesSoldCount: number;
  pendingAmount: number;
  staffPerformance: ReportStaffPerformance[];
  soldItems: ExecutiveReportTableItem[] | any[];
  quotes: ExecutiveReportTableItem[] | any[];
}

// Official Lucide Indian Rupee SVG vector path
const RUPEE_SVG_PATH =
  'M 6 3 h 12 M 6 8 h 12 M 6 13 h 3 c 6.667 0 6.667 -10 0 -10 M 6 13 l 8.5 8';

function drawRupeePrice(
  page: PDFPage,
  x: number,
  y: number,
  amount: number,
  fontSize: number,
  font: PDFFont,
  color: any,
  alignRight: boolean = false
): number {
  const amountStr = Math.round(amount || 0).toLocaleString('en-IN');
  const scale = fontSize / 28;
  const strokeW = Math.max(0.9, fontSize * 0.085);
  const symW = 12 * scale;
  const gap = 3.5 * scale;
  const numW = font.widthOfTextAtSize(amountStr, fontSize);
  const totalW = symW + gap + numW;

  const startX = alignRight ? x - totalW : x;
  let currentX = startX;

  page.drawSvgPath(RUPEE_SVG_PATH, {
    x: currentX - 6 * scale,
    y: y + 21 * scale + strokeW * 0.3,
    scale,
    borderColor: color,
    borderWidth: strokeW,
    borderLineCap: LineCapStyle.Round,
  });

  currentX += symW + gap;

  page.drawText(amountStr, {
    x: currentX,
    y,
    size: fontSize,
    font,
    color,
  });

  return totalW;
}

function fitText(font: PDFFont, text: string, fontSize: number, maxWidth: number): string {
  if (!text) return '';
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) {
    return text;
  }
  let low = 0;
  let high = text.length;
  let best = text;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.substring(0, mid).trimEnd() + '...';
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}

function formatPhone(phone?: string): string {
  if (!phone) return '—';
  if (phone.startsWith('Direct')) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone.startsWith('+') ? phone : `+91 ${phone}`;
}

async function fetchAndEmbedImage(doc: PDFDocument, urlOrBase64?: string): Promise<any | null> {
  if (!urlOrBase64) return null;
  try {
    if (urlOrBase64.startsWith('data:image/png')) {
      const base64Data = urlOrBase64.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return await doc.embedPng(bytes);
    }
    if (urlOrBase64.startsWith('data:image/jpeg') || urlOrBase64.startsWith('data:image/jpg')) {
      const base64Data = urlOrBase64.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return await doc.embedJpg(bytes);
    }

    const res = await fetch(urlOrBase64);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    try {
      return await doc.embedJpg(arrayBuffer);
    } catch {
      return await doc.embedPng(arrayBuffer);
    }
  } catch {
    return null;
  }
}

/**
 * Normalizes input item to standard ExecutiveReportTableItem
 */
function normalizeTableItem(raw: any, defaultStatus: 'pending' | 'called' | 'no deal' | 'sold'): ExecutiveReportTableItem {
  let status = defaultStatus;
  const rawStatus = (raw.status || '').toLowerCase();
  if (rawStatus === 'closed' || rawStatus === 'sold' || rawStatus === 'deal_closed') {
    status = 'sold';
  } else if (
    rawStatus === 'contacted' ||
    rawStatus === 'called' ||
    rawStatus === 'called_interested' ||
    rawStatus === 'called_no_answer'
  ) {
    status = 'called';
  } else if (rawStatus === 'no_deal' || rawStatus === 'lost') {
    status = 'no deal';
  } else if (rawStatus === 'pending') {
    status = 'pending';
  }

  return {
    id: raw.id || `item-${Math.random()}`,
    dateFormatted: raw.dateFormatted || raw.soldAtFormatted || '—',
    customerName: raw.customerName || 'Showroom Customer',
    customerWhatsapp: raw.customerWhatsapp || raw.customer_whatsapp || '',
    productName: raw.productName || raw.name || raw.itemsSummary || 'Luxury Furniture Piece',
    imageUrl: raw.imageUrl || raw.image_url,
    quantity: raw.quantity || 1,
    staffName: raw.staffName || 'Showroom Staff',
    status,
    amount: Number(raw.amount ?? raw.price ?? raw.finalPrice ?? 0),
  };
}

/**
 * Generates an executive, print-ready Showroom Business Report PDF
 * covering the owner's selected custom date range with standard executive header
 * and unified table structure.
 */
export async function generateExecutiveReportPdfBlob(
  payload: ExecutiveReportPayload
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 36;
  const CONTENT_W = PAGE_W - MARGIN * 2; // 523.28 pt

  // Executive Color Palette
  const cDark = rgb(0.06, 0.09, 0.16); // Slate 900 #0F172A
  const cNavy = rgb(0.12, 0.16, 0.28); // Deep Navy #1E293B
  const cIndigo = rgb(0.28, 0.31, 0.90); // Indigo 600 #4F46E5
  const cEmerald = rgb(0.02, 0.60, 0.38); // Emerald 600 #059669
  const cMuted = rgb(0.39, 0.45, 0.55); // Slate 500 #64748B
  const cBorder = rgb(0.88, 0.91, 0.94); // Slate 200 #E2E8F0
  const cWhite = rgb(1, 1, 1);

  // Normalize items for both tables
  const rawSold = payload.soldItems || [];
  const rawQuotes = payload.quotes || [];
  const normalizedSold: ExecutiveReportTableItem[] = rawSold.map((it) => normalizeTableItem(it, 'sold'));
  const normalizedQuotes: ExecutiveReportTableItem[] = rawQuotes.map((it) => normalizeTableItem(it, 'pending'));

  // Pre-fetch and cache distinct product images
  const imageCache = new Map<string, any>();
  const distinctUrls = Array.from(
    new Set(
      [...normalizedSold, ...normalizedQuotes]
        .map((it) => it.imageUrl)
        .filter((url): url is string => Boolean(url && typeof url === 'string'))
    )
  );

  await Promise.all(
    distinctUrls.map(async (url) => {
      const img = await fetchAndEmbedImage(pdfDoc, url);
      if (img) imageCache.set(url, img);
    })
  );

  let currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 44;

  // Header Drawer
  const drawHeader = (page: PDFPage, isFirstPage: boolean) => {
    if (isFirstPage) {
      // 1. Sleek Top Accent Bar
      page.drawRectangle({
        x: MARGIN,
        y: PAGE_H - 22,
        width: CONTENT_W,
        height: 3.5,
        color: cIndigo,
      });

      // 2. Left Brand Monogram Logo Box
      const logoSize = 38;
      page.drawRectangle({
        x: MARGIN,
        y: y - logoSize + 10,
        width: logoSize,
        height: logoSize,
        color: cNavy,
      });

      page.drawText('AF', {
        x: MARGIN + 9,
        y: y - logoSize + 22,
        size: 15,
        font: fontBold,
        color: cWhite,
      });

      // Left Brand Typography
      const brandX = MARGIN + logoSize + 12;
      page.drawText('ALISHAN FURNITURES', {
        x: brandX,
        y: y + 2,
        size: 16,
        font: fontBold,
        color: cDark,
      });

      page.drawText('LUXURY LIVING & BESPOKE INTERIORS', {
        x: brandX,
        y: y - 10,
        size: 7.5,
        font: fontBold,
        color: cIndigo,
      });

      page.drawText('Official Showroom Executive Audit & Business Intelligence Report', {
        x: brandX,
        y: y - 21,
        size: 7,
        font: fontRegular,
        color: cMuted,
      });

      // 3. Right Executive Metadata Card
      const cardW = 196;
      const cardH = 44;
      const cardX = PAGE_W - MARGIN - cardW;
      const cardY = y - logoSize + 4;

      page.drawRectangle({
        x: cardX,
        y: cardY,
        width: cardW,
        height: cardH,
        color: rgb(0.97, 0.98, 1.0),
        borderColor: rgb(0.85, 0.88, 0.96),
        borderWidth: 0.75,
      });

      // Row 1: Reporting Period
      page.drawText('AUDIT PERIOD:', {
        x: cardX + 10,
        y: cardY + 30,
        size: 6.5,
        font: fontBold,
        color: cIndigo,
      });
      page.drawText(`${payload.fromDateFormatted}  to  ${payload.toDateFormatted}`, {
        x: cardX + 68,
        y: cardY + 30,
        size: 7.5,
        font: fontBold,
        color: cDark,
      });

      // Row 2: Generated On
      page.drawText('Generated On:', {
        x: cardX + 10,
        y: cardY + 18,
        size: 6.5,
        font: fontRegular,
        color: cMuted,
      });
      page.drawText(payload.generatedAtFormatted, {
        x: cardX + 68,
        y: cardY + 18,
        size: 6.5,
        font: fontRegular,
        color: cDark,
      });

      // Row 3: Account Owner
      page.drawText('Audited For:', {
        x: cardX + 10,
        y: cardY + 7,
        size: 6.5,
        font: fontRegular,
        color: cMuted,
      });
      page.drawText(payload.ownerName || 'Vikram Mehta (Owner)', {
        x: cardX + 68,
        y: cardY + 7,
        size: 6.5,
        font: fontBold,
        color: cDark,
      });

      // Divider Line below header
      y = cardY - 14;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_W - MARGIN, y },
        thickness: 0.75,
        color: cBorder,
      });
      y -= 16;
    } else {
      // Continuation Header
      page.drawRectangle({
        x: MARGIN,
        y: PAGE_H - 20,
        width: CONTENT_W,
        height: 2,
        color: cIndigo,
      });

      page.drawText('ALISHAN FURNITURES  |  Executive Showroom Audit Report', {
        x: MARGIN,
        y: PAGE_H - 34,
        size: 8,
        font: fontBold,
        color: cDark,
      });

      const subStamp = `Period: ${payload.fromDateFormatted} to ${payload.toDateFormatted}`;
      const subW = fontRegular.widthOfTextAtSize(subStamp, 7.5);
      page.drawText(subStamp, {
        x: PAGE_W - MARGIN - subW,
        y: PAGE_H - 34,
        size: 7.5,
        font: fontRegular,
        color: cMuted,
      });

      page.drawLine({
        start: { x: MARGIN, y: PAGE_H - 40 },
        end: { x: PAGE_W - MARGIN, y: PAGE_H - 40 },
        thickness: 0.5,
        color: cBorder,
      });

      y = PAGE_H - 56;
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y - neededHeight < MARGIN + 30) {
      currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      drawHeader(currentPage, false);
      return true;
    }
    return false;
  };

  // Initial First Page Header
  drawHeader(currentPage, true);

  // =========================================================================
  // SECTION 1: 4 EXECUTIVE KPI SUMMARY CARDS
  // =========================================================================
  const cardGap = 8;
  const numCards = 4;
  const cardW = (CONTENT_W - cardGap * (numCards - 1)) / numCards;
  const cardH = 50;

  const kpis = [
    {
      title: 'TOTAL REVENUE',
      value: payload.totalRevenue || 0,
      isRupee: true,
      color: cEmerald,
      sub: `${payload.closedDealsCount || 0} Deals Closed`,
    },
    {
      title: 'PIECES SOLD',
      value: `${payload.piecesSoldCount || 0} Units`,
      isRupee: false,
      color: rgb(0.10, 0.45, 0.90),
      sub: 'Delivered / Booked',
    },
    {
      title: 'CLOSED DEALS',
      value: String(payload.closedDealsCount || 0),
      isRupee: false,
      color: cIndigo,
      sub: `From ${payload.quotesCount || 0} Quotes`,
    },
    {
      title: 'QUOTES LOGGED',
      value: String(payload.quotesCount || 0),
      isRupee: false,
      color: rgb(0.70, 0.35, 0.05),
      sub: `${payload.totalVisitors || 0} Customer Visits`,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = MARGIN + idx * (cardW + cardGap);
    currentPage.drawRectangle({
      x: cardX,
      y: y - cardH,
      width: cardW,
      height: cardH,
      color: rgb(0.985, 0.99, 1.0),
      borderColor: cBorder,
      borderWidth: 0.75,
    });

    currentPage.drawRectangle({
      x: cardX,
      y: y - 3,
      width: cardW,
      height: 3,
      color: kpi.color,
    });

    currentPage.drawText(kpi.title, {
      x: cardX + 10,
      y: y - 14,
      size: 6.5,
      font: fontBold,
      color: cMuted,
    });

    if (kpi.isRupee) {
      drawRupeePrice(currentPage, cardX + 10, y - 30, kpi.value as number, 11, fontBold, kpi.color);
    } else {
      currentPage.drawText(String(kpi.value), {
        x: cardX + 10,
        y: y - 30,
        size: 11,
        font: fontBold,
        color: kpi.color,
      });
    }

    currentPage.drawText(kpi.sub, {
      x: cardX + 10,
      y: y - 42,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });
  });

  y -= cardH + 18;

  // =========================================================================
  // SECTION 2: SALES CONSULTANT PERFORMANCE BREAKDOWN
  // =========================================================================
  checkPageBreak(80);

  currentPage.drawText('SALES CONSULTANT PERFORMANCE', {
    x: MARGIN,
    y,
    size: 9.5,
    font: fontBold,
    color: cDark,
  });
  y -= 14;

  const staffTableH = 18;
  currentPage.drawRectangle({
    x: MARGIN,
    y: y - staffTableH,
    width: CONTENT_W,
    height: staffTableH,
    color: cNavy,
  });

  const staffCols = [
    { title: 'CONSULTANT NAME', x: MARGIN + 8, w: 160 },
    { title: 'QUOTES', x: MARGIN + 180, w: 60 },
    { title: 'WON DEALS', x: MARGIN + 250, w: 70 },
    { title: 'CONVERSION', x: MARGIN + 330, w: 70 },
    { title: 'REVENUE GENERATED', x: MARGIN + 410, w: 105, alignRight: true },
  ];

  staffCols.forEach((col) => {
    currentPage.drawText(col.title, {
      x: col.alignRight ? col.x + col.w - fontBold.widthOfTextAtSize(col.title, 6.5) : col.x,
      y: y - 12,
      size: 6.5,
      font: fontBold,
      color: cWhite,
    });
  });

  y -= staffTableH;

  const staffPerfList = payload.staffPerformance || [];
  if (staffPerfList.length === 0) {
    currentPage.drawRectangle({
      x: MARGIN,
      y: y - 20,
      width: CONTENT_W,
      height: 20,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 0.5,
    });
    currentPage.drawText('No consultant activity recorded in this period.', {
      x: MARGIN + 12,
      y: y - 14,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
    y -= 20;
  } else {
    staffPerfList.forEach((sp, i) => {
      checkPageBreak(20);
      const rowBg = i % 2 === 0 ? cWhite : rgb(0.985, 0.985, 0.99);
      currentPage.drawRectangle({
        x: MARGIN,
        y: y - 18,
        width: CONTENT_W,
        height: 18,
        color: rowBg,
        borderColor: cBorder,
        borderWidth: 0.5,
      });

      currentPage.drawText(fitText(fontBold, sp.staffName, 8, 150), {
        x: MARGIN + 8,
        y: y - 12,
        size: 8,
        font: fontBold,
        color: cDark,
      });

      currentPage.drawText(String(sp.quotesCount), {
        x: MARGIN + 180,
        y: y - 12,
        size: 8,
        font: fontRegular,
        color: cDark,
      });

      currentPage.drawText(String(sp.closedDealsCount), {
        x: MARGIN + 250,
        y: y - 12,
        size: 8,
        font: fontBold,
        color: cEmerald,
      });

      const convPct = sp.quotesCount > 0 ? `${Math.round((sp.closedDealsCount / sp.quotesCount) * 100)}%` : '0%';
      currentPage.drawText(convPct, {
        x: MARGIN + 330,
        y: y - 12,
        size: 8,
        font: fontRegular,
        color: cMuted,
      });

      drawRupeePrice(currentPage, MARGIN + 515, y - 12, sp.revenue, 8, fontBold, cDark, true);

      y -= 18;
    });
  }

  y -= 18;

  // =========================================================================
  // UNIFIED TABLE DRAWING ENGINE (FOR BOTH SOLD PIECES & QUOTATIONS AUDIT)
  // Columns: Date | Customer & Mobile | Furniture Piece & Preview | Qty | Staff | Status | Amount
  // =========================================================================
  const unifiedCols = [
    { title: 'DATE', x: MARGIN + 6, w: 42 },
    { title: 'CUSTOMER & MOBILE', x: MARGIN + 50, w: 92 },
    { title: 'FURNITURE ITEM & PREVIEW', x: MARGIN + 144, w: 154 },
    { title: 'QTY', x: MARGIN + 300, w: 26, alignCenter: true },
    { title: 'STAFF', x: MARGIN + 328, w: 60 },
    { title: 'STATUS', x: MARGIN + 390, w: 56, alignCenter: true },
    { title: 'AMOUNT', x: MARGIN + 448, w: 69, alignRight: true },
  ];

  const drawUnifiedTableHeader = () => {
    const tableHeaderH = 18;
    currentPage.drawRectangle({
      x: MARGIN,
      y: y - tableHeaderH,
      width: CONTENT_W,
      height: tableHeaderH,
      color: cNavy,
    });

    unifiedCols.forEach((col) => {
      let titleX = col.x;
      const textW = fontBold.widthOfTextAtSize(col.title, 6.5);
      if (col.alignRight) {
        titleX = col.x + col.w - textW;
      } else if (col.alignCenter) {
        titleX = col.x + (col.w - textW) / 2;
      }

      currentPage.drawText(col.title, {
        x: titleX,
        y: y - 12,
        size: 6.5,
        font: fontBold,
        color: cWhite,
      });
    });

    y -= tableHeaderH;
  };

  const drawUnifiedTable = (
    title: string,
    items: ExecutiveReportTableItem[],
    emptyMessage: string
  ) => {
    checkPageBreak(90);

    currentPage.drawText(title, {
      x: MARGIN,
      y,
      size: 9.5,
      font: fontBold,
      color: cDark,
    });
    y -= 14;

    drawUnifiedTableHeader();

    if (items.length === 0) {
      currentPage.drawRectangle({
        x: MARGIN,
        y: y - 22,
        width: CONTENT_W,
        height: 22,
        color: cWhite,
        borderColor: cBorder,
        borderWidth: 0.5,
      });
      currentPage.drawText(emptyMessage, {
        x: MARGIN + 12,
        y: y - 15,
        size: 8,
        font: fontRegular,
        color: cMuted,
      });
      y -= 22;
    } else {
      const rowH = 32;

      items.forEach((item, i) => {
        const didBreak = checkPageBreak(rowH + 6);
        if (didBreak) {
          drawUnifiedTableHeader();
        }

        const rowBg = i % 2 === 0 ? cWhite : rgb(0.985, 0.985, 0.99);
        currentPage.drawRectangle({
          x: MARGIN,
          y: y - rowH,
          width: CONTENT_W,
          height: rowH,
          color: rowBg,
          borderColor: cBorder,
          borderWidth: 0.5,
        });

        // 1. DATE
        currentPage.drawText(fitText(fontRegular, item.dateFormatted, 6.8, 40), {
          x: MARGIN + 6,
          y: y - 19,
          size: 6.8,
          font: fontRegular,
          color: cMuted,
        });

        // 2. CUSTOMER NAME & MOBILE NUMBER
        const custName = fitText(fontBold, item.customerName || 'Showroom Customer', 7.5, 88);
        currentPage.drawText(custName, {
          x: MARGIN + 50,
          y: y - 13,
          size: 7.5,
          font: fontBold,
          color: cDark,
        });

        const custPhone = fitText(fontRegular, formatPhone(item.customerWhatsapp), 6.5, 88);
        currentPage.drawText(custPhone, {
          x: MARGIN + 50,
          y: y - 23,
          size: 6.5,
          font: fontRegular,
          color: cMuted,
        });

        // 3. FURNITURE IMAGE THUMBNAIL & NAME
        const thumbSize = 24;
        const thumbX = MARGIN + 144;
        const thumbY = y - thumbSize - 4;

        const img = item.imageUrl ? imageCache.get(item.imageUrl) : null;
        if (img) {
          currentPage.drawImage(img, {
            x: thumbX,
            y: thumbY,
            width: thumbSize,
            height: thumbSize,
          });
          currentPage.drawRectangle({
            x: thumbX,
            y: thumbY,
            width: thumbSize,
            height: thumbSize,
            borderColor: cBorder,
            borderWidth: 0.5,
          });
        } else {
          // Placeholder Box
          currentPage.drawRectangle({
            x: thumbX,
            y: thumbY,
            width: thumbSize,
            height: thumbSize,
            color: rgb(0.94, 0.95, 0.98),
            borderColor: cBorder,
            borderWidth: 0.5,
          });
          currentPage.drawText('AF', {
            x: thumbX + 6,
            y: thumbY + 8,
            size: 7.5,
            font: fontBold,
            color: cIndigo,
          });
        }

        const textLeft = thumbX + thumbSize + 6;
        const prodName = fitText(fontBold, item.productName || 'Bespoke Furniture', 7.5, 120);
        currentPage.drawText(prodName, {
          x: textLeft,
          y: y - 14,
          size: 7.5,
          font: fontBold,
          color: cDark,
        });

        const prodTag = fitText(fontRegular, 'Showroom Display / Order', 6, 120);
        currentPage.drawText(prodTag, {
          x: textLeft,
          y: y - 23,
          size: 6,
          font: fontRegular,
          color: cMuted,
        });

        // 4. QUANTITY
        const qtyStr = String(item.quantity || 1);
        const qtyW = fontBold.widthOfTextAtSize(qtyStr, 7.5);
        currentPage.drawText(qtyStr, {
          x: MARGIN + 300 + (26 - qtyW) / 2,
          y: y - 19,
          size: 7.5,
          font: fontBold,
          color: cIndigo,
        });

        // 5. STAFF
        currentPage.drawText(fitText(fontRegular, item.staffName || 'Staff', 7.2, 56), {
          x: MARGIN + 328,
          y: y - 19,
          size: 7.2,
          font: fontRegular,
          color: cDark,
        });

        // 6. STATUS PILL (Pending, Called, No Deal, Sold)
        const badgeW = 48;
        const badgeH = 14;
        const badgeX = MARGIN + 390 + (56 - badgeW) / 2;
        const badgeY = y - 23;

        let badgeBg = rgb(0.92, 0.98, 0.94);
        let badgeBorder = rgb(0.65, 0.92, 0.75);
        let badgeColor = rgb(0.04, 0.47, 0.28);
        let badgeLabel = 'SOLD';

        if (item.status === 'pending') {
          badgeBg = rgb(1.0, 0.97, 0.90);
          badgeBorder = rgb(0.99, 0.85, 0.55);
          badgeColor = rgb(0.70, 0.35, 0.05);
          badgeLabel = 'PENDING';
        } else if (item.status === 'called') {
          badgeBg = rgb(0.93, 0.96, 1.0);
          badgeBorder = rgb(0.70, 0.84, 0.98);
          badgeColor = rgb(0.08, 0.40, 0.75);
          badgeLabel = 'CALLED';
        } else if (item.status === 'no deal') {
          badgeBg = rgb(1.0, 0.93, 0.94);
          badgeBorder = rgb(0.98, 0.75, 0.78);
          badgeColor = rgb(0.75, 0.15, 0.22);
          badgeLabel = 'NO DEAL';
        }

        currentPage.drawRectangle({
          x: badgeX,
          y: badgeY,
          width: badgeW,
          height: badgeH,
          color: badgeBg,
          borderColor: badgeBorder,
          borderWidth: 0.5,
        });

        const labelW = fontBold.widthOfTextAtSize(badgeLabel, 6);
        currentPage.drawText(badgeLabel, {
          x: badgeX + (badgeW - labelW) / 2,
          y: badgeY + 4,
          size: 6,
          font: fontBold,
          color: badgeColor,
        });

        // 7. AMOUNT
        drawRupeePrice(currentPage, MARGIN + 517, y - 19, item.amount, 7.5, fontBold, cDark, true);

        y -= rowH;
      });
    }

    y -= 18;
  };

  // =========================================================================
  // SECTION 3: SOLD FURNITURE PIECES TABLE
  // =========================================================================
  drawUnifiedTable(
    `SOLD FURNITURE PIECES (${normalizedSold.length} Items Closed)`,
    normalizedSold,
    'No sold inventory items recorded in this selected timeframe.'
  );

  // =========================================================================
  // SECTION 4: QUOTATIONS AUDIT LOG TABLE
  // =========================================================================
  drawUnifiedTable(
    `QUOTATIONS AUDIT LOG (${normalizedQuotes.length} Quotes Audited)`,
    normalizedQuotes,
    'No quotes generated within this selected timeframe.'
  );

  // =========================================================================
  // FOOTER & PAGE NUMBERING ACROSS ALL PAGES
  // =========================================================================
  const totalPages = pdfDoc.getPageCount();
  pdfDoc.getPages().forEach((p, idx) => {
    p.drawLine({
      start: { x: MARGIN, y: MARGIN + 14 },
      end: { x: PAGE_W - MARGIN, y: MARGIN + 14 },
      thickness: 0.5,
      color: cBorder,
    });

    p.drawText('Alishan Furnitures Showroom Management System • Strictly Confidential & Proprietary', {
      x: MARGIN,
      y: MARGIN + 4,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });

    const pageStr = `Page ${idx + 1} of ${totalPages}`;
    const pageW = fontRegular.widthOfTextAtSize(pageStr, 6.5);
    p.drawText(pageStr, {
      x: PAGE_W - MARGIN - pageW,
      y: MARGIN + 4,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
