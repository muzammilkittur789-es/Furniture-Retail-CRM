import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, LineCapStyle } from 'pdf-lib';

export interface ReportQuoteItem {
  id: string;
  dateFormatted: string;
  customerName: string;
  customerWhatsapp: string;
  itemsSummary: string;
  staffName: string;
  status: 'closed' | 'pending';
  finalPrice: number;
  advanceDeposit?: number;
}

export interface ReportSoldItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customerWhatsapp: string;
  staffName: string;
  soldAtFormatted: string;
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
  quotes: ReportQuoteItem[];
  soldItems: ReportSoldItem[];
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
  const amountStr = Math.round(amount).toLocaleString('en-IN');
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

/**
 * Generates an executive, print-ready Showroom Business Report PDF
 * covering the owner's selected custom date range.
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

  // Color palette
  const cDark = rgb(0.06, 0.09, 0.16); // Slate 900
  const cIndigo = rgb(0.28, 0.31, 0.90); // Indigo 600
  const cEmerald = rgb(0.02, 0.60, 0.38); // Emerald 600
  const cMuted = rgb(0.39, 0.45, 0.55); // Slate 500
  const cLight = rgb(0.96, 0.97, 0.98); // Slate 50
  const cBorder = rgb(0.88, 0.91, 0.94); // Slate 200
  const cWhite = rgb(1, 1, 1);

  let currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const drawHeader = (page: PDFPage, isFirstPage: boolean) => {
    if (isFirstPage) {
      // Top colored accent bar
      page.drawRectangle({
        x: MARGIN,
        y: y - 4,
        width: CONTENT_W,
        height: 4,
        color: cIndigo,
      });
      y -= 14;

      // Brand Title
      page.drawText('ALISHAN FURNITURES', {
        x: MARGIN,
        y,
        size: 18,
        font: fontBold,
        color: cDark,
      });

      // Document Badge
      const badgeText = 'EXECUTIVE SHOWROOM AUDIT REPORT';
      const badgeW = fontBold.widthOfTextAtSize(badgeText, 8.5) + 16;
      page.drawRectangle({
        x: PAGE_W - MARGIN - badgeW,
        y: y - 2,
        width: badgeW,
        height: 18,
        color: rgb(0.93, 0.94, 0.99),
        borderColor: rgb(0.80, 0.82, 0.98),
        borderWidth: 1,
      });
      page.drawText(badgeText, {
        x: PAGE_W - MARGIN - badgeW + 8,
        y: y + 3,
        size: 8.5,
        font: fontBold,
        color: cIndigo,
      });

      y -= 18;

      // Subtitle & Filter Window
      page.drawText(`Custom Period: ${payload.fromDateFormatted}  to  ${payload.toDateFormatted}`, {
        x: MARGIN,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.15, 0.20, 0.30),
      });

      const genStamp = `Generated: ${payload.generatedAtFormatted}`;
      const genW = fontRegular.widthOfTextAtSize(genStamp, 8);
      page.drawText(genStamp, {
        x: PAGE_W - MARGIN - genW,
        y,
        size: 8,
        font: fontRegular,
        color: cMuted,
      });

      y -= 14;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_W - MARGIN, y },
        thickness: 0.75,
        color: cBorder,
      });
      y -= 16;
    } else {
      // Continuation Header
      page.drawText(`ALISHAN FURNITURES - Executive Audit Report (${payload.fromDateFormatted} - ${payload.toDateFormatted})`, {
        x: MARGIN,
        y,
        size: 8.5,
        font: fontBold,
        color: cMuted,
      });
      y -= 8;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_W - MARGIN, y },
        thickness: 0.5,
        color: cBorder,
      });
      y -= 16;
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y - neededHeight < MARGIN + 30) {
      currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      drawHeader(currentPage, false);
    }
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
    { label: 'Total Revenue', amount: payload.totalRevenue, isPrice: true, color: cEmerald },
    { label: 'Closed Deals', value: `${payload.closedDealsCount} deals`, isPrice: false, color: cDark },
    { label: 'Pieces Sold', value: `${payload.piecesSoldCount} units`, isPrice: false, color: cIndigo },
    { label: 'Total Quotes', value: `${payload.quotesCount} generated`, isPrice: false, color: cDark },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = MARGIN + idx * (cardW + cardGap);
    currentPage.drawRectangle({
      x: cardX,
      y: y - cardH,
      width: cardW,
      height: cardH,
      color: cLight,
      borderColor: cBorder,
      borderWidth: 0.75,
    });

    currentPage.drawText(kpi.label, {
      x: cardX + 8,
      y: y - 16,
      size: 7.5,
      font: fontBold,
      color: cMuted,
    });

    if (kpi.isPrice && kpi.amount !== undefined) {
      drawRupeePrice(currentPage, cardX + 8, y - 36, kpi.amount, 12, fontBold, kpi.color);
    } else if (kpi.value) {
      currentPage.drawText(kpi.value, {
        x: cardX + 8,
        y: y - 36,
        size: 11,
        font: fontBold,
        color: kpi.color,
      });
    }
  });

  y -= cardH + 20;

  // =========================================================================
  // SECTION 2: SALES CONSULTANT PERFORMANCE BREAKDOWN
  // =========================================================================
  checkPageBreak(90);

  currentPage.drawText('SALES CONSULTANT PERFORMANCE', {
    x: MARGIN,
    y,
    size: 9.5,
    font: fontBold,
    color: cDark,
  });
  y -= 14;

  // Table Header
  const staffTableH = 18;
  currentPage.drawRectangle({
    x: MARGIN,
    y: y - staffTableH,
    width: CONTENT_W,
    height: staffTableH,
    color: rgb(0.12, 0.16, 0.24),
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
  // Table Rows
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
      const rowBg = i % 2 === 0 ? cWhite : rgb(0.98, 0.98, 0.99);
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

  y -= 16;

  // =========================================================================
  // SECTION 3: ITEMIZED CLOSED DEALS & SOLD PIECES
  // =========================================================================
  checkPageBreak(90);

  currentPage.drawText(`SOLD FURNITURE PIECES (${payload.soldItems.length} Records)`, {
    x: MARGIN,
    y,
    size: 9.5,
    font: fontBold,
    color: cDark,
  });
  y -= 14;

  const soldTableH = 18;
  currentPage.drawRectangle({
    x: MARGIN,
    y: y - soldTableH,
    width: CONTENT_W,
    height: soldTableH,
    color: rgb(0.12, 0.16, 0.24),
  });

  const soldCols = [
    { title: 'SOLD DATE', x: MARGIN + 8, w: 65 },
    { title: 'FURNITURE ITEM', x: MARGIN + 75, w: 180 },
    { title: 'QTY', x: MARGIN + 260, w: 30 },
    { title: 'CUSTOMER / WHATSAPP', x: MARGIN + 295, w: 110 },
    { title: 'CONSULTANT', x: MARGIN + 410, w: 55 },
    { title: 'AMOUNT', x: MARGIN + 470, w: 45, alignRight: true },
  ];

  soldCols.forEach((col) => {
    currentPage.drawText(col.title, {
      x: col.alignRight ? col.x + col.w - fontBold.widthOfTextAtSize(col.title, 6.5) : col.x,
      y: y - 12,
      size: 6.5,
      font: fontBold,
      color: cWhite,
    });
  });

  y -= soldTableH;

  const soldItemsList = payload.soldItems || [];
  if (soldItemsList.length === 0) {
    currentPage.drawRectangle({
      x: MARGIN,
      y: y - 20,
      width: CONTENT_W,
      height: 20,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 0.5,
    });
    currentPage.drawText('No furniture pieces closed in this selected timeframe.', {
      x: MARGIN + 12,
      y: y - 14,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
    y -= 20;
  } else {
    soldItemsList.forEach((item, i) => {
      checkPageBreak(19);
      const rowBg = i % 2 === 0 ? cWhite : rgb(0.98, 0.98, 0.99);
      currentPage.drawRectangle({
        x: MARGIN,
        y: y - 18,
        width: CONTENT_W,
        height: 18,
        color: rowBg,
        borderColor: cBorder,
        borderWidth: 0.5,
      });

      currentPage.drawText(fitText(fontRegular, item.soldAtFormatted, 7, 60), {
        x: MARGIN + 8,
        y: y - 12,
        size: 7,
        font: fontRegular,
        color: cMuted,
      });

      currentPage.drawText(fitText(fontBold, item.name, 7.5, 175), {
        x: MARGIN + 75,
        y: y - 12,
        size: 7.5,
        font: fontBold,
        color: cDark,
      });

      currentPage.drawText(String(item.quantity || 1), {
        x: MARGIN + 265,
        y: y - 12,
        size: 7.5,
        font: fontBold,
        color: cIndigo,
      });

      const custLabel = item.customerWhatsapp.startsWith('Direct') ? item.customerWhatsapp : `+91 ${item.customerWhatsapp}`;
      currentPage.drawText(fitText(fontRegular, custLabel, 7, 105), {
        x: MARGIN + 295,
        y: y - 12,
        size: 7,
        font: fontRegular,
        color: cDark,
      });

      currentPage.drawText(fitText(fontRegular, item.staffName.split(' ')[0], 7.5, 50), {
        x: MARGIN + 410,
        y: y - 12,
        size: 7.5,
        font: fontRegular,
        color: cMuted,
      });

      drawRupeePrice(currentPage, MARGIN + 515, y - 12, item.price, 7.5, fontBold, cDark, true);

      y -= 18;
    });
  }

  y -= 16;

  // =========================================================================
  // SECTION 4: ALL QUOTATIONS IN PERIOD
  // =========================================================================
  checkPageBreak(90);

  currentPage.drawText(`QUOTATIONS AUDIT LOG (${payload.quotes.length} Quotes)`, {
    x: MARGIN,
    y,
    size: 9.5,
    font: fontBold,
    color: cDark,
  });
  y -= 14;

  const quoteTableH = 18;
  currentPage.drawRectangle({
    x: MARGIN,
    y: y - quoteTableH,
    width: CONTENT_W,
    height: quoteTableH,
    color: rgb(0.12, 0.16, 0.24),
  });

  const quoteCols = [
    { title: 'DATE', x: MARGIN + 8, w: 65 },
    { title: 'CUSTOMER NAME', x: MARGIN + 75, w: 100 },
    { title: 'ITEMS QUOTED', x: MARGIN + 180, w: 150 },
    { title: 'STATUS', x: MARGIN + 335, w: 50 },
    { title: 'STAFF', x: MARGIN + 390, w: 55 },
    { title: 'FINAL VALUE', x: MARGIN + 450, w: 65, alignRight: true },
  ];

  quoteCols.forEach((col) => {
    currentPage.drawText(col.title, {
      x: col.alignRight ? col.x + col.w - fontBold.widthOfTextAtSize(col.title, 6.5) : col.x,
      y: y - 12,
      size: 6.5,
      font: fontBold,
      color: cWhite,
    });
  });

  y -= quoteTableH;

  const quotesList = payload.quotes || [];
  if (quotesList.length === 0) {
    currentPage.drawRectangle({
      x: MARGIN,
      y: y - 20,
      width: CONTENT_W,
      height: 20,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 0.5,
    });
    currentPage.drawText('No quotes generated within this selected timeframe.', {
      x: MARGIN + 12,
      y: y - 14,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
    y -= 20;
  } else {
    quotesList.forEach((q, i) => {
      checkPageBreak(19);
      const rowBg = i % 2 === 0 ? cWhite : rgb(0.98, 0.98, 0.99);
      currentPage.drawRectangle({
        x: MARGIN,
        y: y - 18,
        width: CONTENT_W,
        height: 18,
        color: rowBg,
        borderColor: cBorder,
        borderWidth: 0.5,
      });

      currentPage.drawText(fitText(fontRegular, q.dateFormatted, 7, 60), {
        x: MARGIN + 8,
        y: y - 12,
        size: 7,
        font: fontRegular,
        color: cMuted,
      });

      currentPage.drawText(fitText(fontBold, q.customerName || 'Customer', 7.5, 95), {
        x: MARGIN + 75,
        y: y - 12,
        size: 7.5,
        font: fontBold,
        color: cDark,
      });

      currentPage.drawText(fitText(fontRegular, q.itemsSummary, 7, 145), {
        x: MARGIN + 180,
        y: y - 12,
        size: 7,
        font: fontRegular,
        color: cDark,
      });

      const isWon = q.status === 'closed';
      const statusText = isWon ? 'CLOSED' : 'PENDING';
      const statusColor = isWon ? cEmerald : rgb(0.85, 0.50, 0.05);
      currentPage.drawText(statusText, {
        x: MARGIN + 335,
        y: y - 12,
        size: 7,
        font: fontBold,
        color: statusColor,
      });

      currentPage.drawText(fitText(fontRegular, q.staffName.split(' ')[0], 7.5, 50), {
        x: MARGIN + 390,
        y: y - 12,
        size: 7.5,
        font: fontRegular,
        color: cMuted,
      });

      drawRupeePrice(currentPage, MARGIN + 515, y - 12, q.finalPrice, 7.5, fontBold, cDark, true);

      y -= 18;
    });
  }

  y -= 16;

  // =========================================================================
  // SECTION 5: COMPLIANCE FOOTER ON ALL PAGES
  // =========================================================================
  const allPages = pdfDoc.getPages();
  const totalPages = allPages.length;

  allPages.forEach((pg, pageIdx) => {
    pg.drawLine({
      start: { x: MARGIN, y: MARGIN + 16 },
      end: { x: PAGE_W - MARGIN, y: MARGIN + 16 },
      thickness: 0.5,
      color: cBorder,
    });

    const leftFoot = 'CONFIDENTIAL • ALISHAN FURNITURES RETAIL MANAGEMENT OS • HALAL COMMERCE AUDIT';
    pg.drawText(leftFoot, {
      x: MARGIN,
      y: MARGIN + 6,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });

    const pageFoot = `Page ${pageIdx + 1} of ${totalPages}`;
    const pfW = fontRegular.widthOfTextAtSize(pageFoot, 6.5);
    pg.drawText(pageFoot, {
      x: PAGE_W - MARGIN - pfW,
      y: MARGIN + 6,
      size: 6.5,
      font: fontRegular,
      color: cMuted,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
