import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, LineCapStyle } from 'pdf-lib';

export interface QuotePdfItem {
  name: string;
  material: string;
  dimensions?: string;
  more_info?: string;
  price: number;
  quantity?: number;
  image_url?: string;
}

export interface QuotePdfPayload {
  quoteId: string;
  shortRef: string;
  dateFormatted: string;
  validUntilFormatted: string;
  staffName: string;
  customerName?: string;
  customerWhatsapp: string;
  orderNotes?: string;
  advanceDeposit?: number;
  items: QuotePdfItem[];
  subtotal: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  finalPrice: number;
}

// Official Lucide Indian Rupee SVG vector path
const RUPEE_SVG_PATH =
  'M 6 3 h 12 M 6 8 h 12 M 6 13 h 3 c 6.667 0 6.667 -10 0 -10 M 6 13 l 8.5 8';

/**
 * Draws the clean official Indian Rupee symbol vector (₹) + formatted number.
 * Uses exact Lucide vector path with rounded line-caps, fully aligned with digits.
 */
function drawRupeePrice(
  page: PDFPage,
  x: number,
  y: number,
  amount: number,
  fontSize: number,
  font: PDFFont,
  color: any,
  alignRight: boolean = false,
  isNegative: boolean = false
): number {
  const amountStr = Math.round(amount).toLocaleString('en-IN');
  // Optically tuned scale: matches digit cap height (0.71*size) without dominating numbers
  const scale = fontSize / 28;
  const strokeW = Math.max(1.0, fontSize * 0.088);
  const symW = 12 * scale;
  const gap = 3.5 * scale;
  const minusW = isNegative ? font.widthOfTextAtSize('-', fontSize) + 1 : 0;
  const numW = font.widthOfTextAtSize(amountStr, fontSize);
  const totalW = minusW + symW + gap + numW;

  const startX = alignRight ? x - totalW : x;
  let currentX = startX;

  // Optional minus sign for discounts
  if (isNegative) {
    page.drawText('-', {
      x: currentX,
      y,
      size: fontSize,
      font,
      color,
    });
    currentX += minusW;
  }

  // Draw clean official Indian Rupee symbol (₹) vector
  page.drawSvgPath(RUPEE_SVG_PATH, {
    x: currentX - 6 * scale,
    y: y + 21 * scale + strokeW * 0.3,
    scale,
    borderColor: color,
    borderWidth: strokeW,
    borderLineCap: LineCapStyle.Round,
  });

  currentX += symW + gap;

  // Number text
  page.drawText(amountStr, {
    x: currentX,
    y,
    size: fontSize,
    font,
    color,
  });

  return totalW;
}

/**
 * Fits text within a given point width in the PDF, truncating only if it genuinely overflows.
 */
function fitTextToWidth(
  font: PDFFont,
  text: string,
  fontSize: number,
  maxWidth: number
): string {
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
 * Fetches and embeds an image URL or base64 into the PDF document.
 */
async function fetchAndEmbedImage(
  doc: PDFDocument,
  urlOrBase64?: string
): Promise<any | null> {
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

    // HTTP / HTTPS URL
    const res = await fetch(urlOrBase64, { mode: 'cors' });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();

    // Try JPG first then PNG
    try {
      return await doc.embedJpg(arrayBuffer);
    } catch {
      return await doc.embedPng(arrayBuffer);
    }
  } catch (err) {
    console.warn('Could not embed image in PDF:', err);
    return null;
  }
}

/**
 * Generates an official, high-resolution A4 Quote PDF matching the exact layout of the Quote Document.
 */
export async function generateQuotePdfBlob(data: QuotePdfPayload): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  // A4 Page Size (595.28 x 841.89 points at 72 DPI)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Exact Palette matching the Showroom UI
  const colorNavy = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
  const colorIndigo = rgb(67 / 255, 56 / 255, 202 / 255); // #4338CA
  const colorEmeraldBg = rgb(236 / 255, 253 / 255, 245 / 255); // #ECFDF5
  const colorEmeraldBorder = rgb(167 / 255, 243 / 255, 208 / 255); // #A7F3D0
  const colorEmeraldText = rgb(6 / 255, 95 / 255, 70 / 255); // #065F46
  const colorAmberBg = rgb(255 / 255, 251 / 255, 235 / 255); // #FFFBEB
  const colorAmberBorder = rgb(252 / 255, 211 / 255, 77 / 255); // #FCD34D
  const colorAmberTitle = rgb(120 / 255, 53 / 255, 15 / 255); // #78350F
  const colorAmberBody = rgb(146 / 255, 64 / 255, 14 / 255); // #92400E
  const colorSlate = rgb(71 / 255, 85 / 255, 105 / 255); // #475569
  const colorMuted = rgb(148 / 255, 163 / 255, 184 / 255); // #94A3B8
  const colorLightBg = rgb(248 / 255, 250 / 255, 252 / 255); // #F8FAFC
  const colorBorder = rgb(241 / 255, 245 / 255, 249 / 255); // #F1F5F9
  const colorWhite = rgb(1, 1, 1);

  const margin = 40;
  const contentWidth = width - margin * 2;
  let currentY = height - 45;

  // 1. TOP HEADER: Logo & Showroom Title (Left) + Price Quote Pill & Date (Right)
  const logoSize = 40;
  page.drawRectangle({
    x: margin,
    y: currentY - logoSize + 12,
    width: logoSize,
    height: logoSize,
    color: colorIndigo,
  });

  page.drawText('AF', {
    x: margin + 10,
    y: currentY - logoSize + 23,
    size: 16,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText('ALISHAN FURNITURES', {
    x: margin + logoSize + 12,
    y: currentY + 3,
    size: 17,
    font: fontBold,
    color: colorNavy,
  });

  page.drawText('FURNITURE SHOWROOM', {
    x: margin + logoSize + 12,
    y: currentY - 9,
    size: 8,
    font: fontBold,
    color: colorIndigo,
  });

  // Top Right: PRICE QUOTE Pill & Quote Ref
  const pillW = 86;
  const pillH = 18;
  const pillX = width - margin - pillW;
  page.drawRectangle({
    x: pillX,
    y: currentY + 2,
    width: pillW,
    height: pillH,
    color: rgb(238 / 255, 242 / 255, 255 / 255),
    borderColor: rgb(224 / 255, 231 / 255, 255 / 255),
    borderWidth: 1,
  });

  const pillText = 'PRICE QUOTE';
  page.drawText(pillText, {
    x: pillX + (pillW - fontBold.widthOfTextAtSize(pillText, 7.5)) / 2,
    y: currentY + 7,
    size: 7.5,
    font: fontBold,
    color: colorIndigo,
  });

  const refText = `Quote #${data.shortRef}`;
  page.drawText(refText, {
    x: width - margin - fontBold.widthOfTextAtSize(refText, 9.5),
    y: currentY - 12,
    size: 9.5,
    font: fontBold,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  const dateText = data.dateFormatted;
  page.drawText(dateText, {
    x: width - margin - fontRegular.widthOfTextAtSize(dateText, 8.5),
    y: currentY - 24,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });

  currentY -= 52;

  // 2. ATTENDED RIBBON (Full-width light card)
  const ribbonH = 30;
  page.drawRectangle({
    x: margin,
    y: currentY - ribbonH,
    width: contentWidth,
    height: ribbonH,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  // User icon circle
  page.drawCircle({
    x: margin + 18,
    y: currentY - ribbonH / 2,
    size: 5,
    color: rgb(238 / 255, 242 / 255, 255 / 255),
    borderColor: colorIndigo,
    borderWidth: 1,
  });

  let ribbonCursorX = margin + 28;

  const attendedPrefix = 'Attended by: ';
  page.drawText(attendedPrefix, {
    x: ribbonCursorX,
    y: currentY - 19,
    size: 8.5,
    font: fontRegular,
    color: colorSlate,
  });
  ribbonCursorX += fontRegular.widthOfTextAtSize(attendedPrefix, 8.5);

  page.drawText(data.staffName, {
    x: ribbonCursorX,
    y: currentY - 19,
    size: 8.5,
    font: fontBold,
    color: colorNavy,
  });
  ribbonCursorX += fontBold.widthOfTextAtSize(data.staffName, 8.5);

  if (data.customerName && data.customerName.trim()) {
    const sep = '   •   Prepared for: ';
    page.drawText(sep, {
      x: ribbonCursorX,
      y: currentY - 19,
      size: 8.5,
      font: fontRegular,
      color: colorSlate,
    });
    ribbonCursorX += fontRegular.widthOfTextAtSize(sep, 8.5);

    page.drawText(data.customerName.trim(), {
      x: ribbonCursorX,
      y: currentY - 19,
      size: 8.5,
      font: fontBold,
      color: colorNavy,
    });
  }

  const refLabel = `Ref: #${data.shortRef}`;
  page.drawText(refLabel, {
    x: width - margin - 14 - fontBold.widthOfTextAtSize(refLabel, 8.5),
    y: currentY - 19,
    size: 8.5,
    font: fontBold,
    color: colorMuted,
  });

  currentY -= ribbonH + 28;

  // 3. SELECTED ITEMS HEADER
  const totalItemsCount = data.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const itemsHeader = `SELECTED ITEMS (${totalItemsCount})`;
  page.drawText(itemsHeader, {
    x: margin,
    y: currentY,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  currentY -= 16;

  // 4. ITEMS LIST (with Thumbnail Images)
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const qty = item.quantity && item.quantity > 1 ? item.quantity : 1;
    const itemTotal = item.price * qty;

    const thumbSize = 52;
    const textStartX = margin + thumbSize + 14;
    const maxDetailWidth = width - margin - 110 - textStartX;

    // Determine spec lines - never vanish More Info
    const specParts: string[] = [];
    if (item.dimensions) specParts.push(`Size: ${item.dimensions}`);
    if (item.more_info) specParts.push(item.more_info);

    let specLine1 = '';
    let specLine2 = '';

    if (item.dimensions && item.more_info) {
      const combinedSpec = `Size: ${item.dimensions}  •  ${item.more_info}`;
      if (fontBold.widthOfTextAtSize(combinedSpec, 8.5) <= maxDetailWidth) {
        specLine1 = combinedSpec;
      } else {
        specLine1 = `Size: ${item.dimensions}`;
        specLine2 = fitTextToWidth(fontBold, item.more_info, 8.0, maxDetailWidth);
      }
    } else if (specParts.length > 0) {
      specLine1 = fitTextToWidth(fontBold, specParts[0], 8.5, maxDetailWidth);
    }

    const itemRowH = specLine2 ? 74 : 66;

    // A. Embed Thumbnail Image
    const thumbX = margin;
    const thumbY = currentY - itemRowH + 12;

    const embeddedImg = await fetchAndEmbedImage(pdfDoc, item.image_url);
    if (embeddedImg) {
      page.drawImage(embeddedImg, {
        x: thumbX,
        y: thumbY,
        width: thumbSize,
        height: thumbSize,
      });
      // Subtle border around photo
      page.drawRectangle({
        x: thumbX,
        y: thumbY,
        width: thumbSize,
        height: thumbSize,
        borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
        borderWidth: 1,
      });
    } else {
      // Sleek fallback thumbnail placeholder
      page.drawRectangle({
        x: thumbX,
        y: thumbY,
        width: thumbSize,
        height: thumbSize,
        color: rgb(241 / 255, 245 / 255, 249 / 255),
        borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
        borderWidth: 1,
      });
      page.drawText('AF', {
        x: thumbX + 17,
        y: thumbY + 19,
        size: 14,
        font: fontBold,
        color: colorMuted,
      });
    }

    // B. Item Details (Middle)
    // Name (with (xN) if quantity > 1)
    const displayName = qty > 1 ? `${item.name} (x${qty})` : item.name;
    const fittedName = fitTextToWidth(fontBold, displayName, 13, maxDetailWidth);
    page.drawText(fittedName, {
      x: textStartX,
      y: currentY - 12,
      size: 13,
      font: fontBold,
      color: colorNavy,
    });

    // Material & Unit Price Note if qty > 1
    const unitPriceNote = qty > 1 ? `  •  ₹${Math.round(item.price).toLocaleString('en-IN')} each` : '';
    const materialText = `Material: ${item.material}${unitPriceNote}`;
    const fittedMat = fitTextToWidth(fontRegular, materialText, 8.5, maxDetailWidth);
    page.drawText(fittedMat, {
      x: textStartX,
      y: currentY - 26,
      size: 8.5,
      font: fontRegular,
      color: colorSlate,
    });

    // Size / Dimensions & More Info - Drawn in full
    if (specLine1) {
      page.drawText(specLine1, {
        x: textStartX,
        y: specLine2 ? currentY - 38 : currentY - 40,
        size: 8.5,
        font: fontBold,
        color: colorIndigo,
      });
    }
    if (specLine2) {
      page.drawText(specLine2, {
        x: textStartX,
        y: currentY - 49,
        size: 8.0,
        font: fontBold,
        color: colorIndigo,
      });
    }

    // C. Item Price (Right aligned - Line Total)
    drawRupeePrice(
      page,
      width - margin,
      currentY - 26,
      itemTotal,
      16,
      fontBold,
      colorNavy,
      true
    );

    // D. Item Divider Line
    currentY -= itemRowH;
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 0.5,
      color: rgb(241 / 255, 245 / 255, 249 / 255),
    });

    currentY -= 14;
  }

  currentY -= 6;

  // 5. PRICING SUMMARY SECTION
  // Row A: Items Total
  page.drawText('Items Total', {
    x: margin,
    y: currentY,
    size: 11,
    font: fontBold,
    color: rgb(51 / 255, 65 / 255, 85 / 255),
  });

  drawRupeePrice(
    page,
    width - margin,
    currentY,
    data.subtotal,
    14,
    fontBold,
    colorNavy,
    true
  );

  currentY -= 22;

  // Row B: Package Discount Banner (if discount exists)
  const savings = data.subtotal - data.finalPrice;
  if (savings > 0) {
    const discH = 30;
    page.drawRectangle({
      x: margin,
      y: currentY - discH + 4,
      width: contentWidth,
      height: discH,
      color: colorEmeraldBg,
      borderColor: colorEmeraldBorder,
      borderWidth: 1,
    });

    // Sparkle symbol & label
    page.drawText('*', {
      x: margin + 14,
      y: currentY - 14,
      size: 12,
      font: fontBold,
      color: colorEmeraldText,
    });

    const discLabel = 'Discount';

    page.drawText(discLabel, {
      x: margin + 26,
      y: currentY - 14,
      size: 9.5,
      font: fontBold,
      color: colorEmeraldText,
    });

    // Discount Amount with minus
    drawRupeePrice(
      page,
      width - margin - 14,
      currentY - 14,
      savings,
      12,
      fontBold,
      colorEmeraldText,
      true,
      true
    );

    currentY -= discH + 12;
  } else {
    currentY -= 10;
  }

  // Row C: Thin Divider
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 0.5,
    color: rgb(226 / 255, 232 / 255, 240 / 255),
  });

  currentY -= 28;

  // Row D: Final Total
  page.drawText('FINAL TOTAL', {
    x: margin,
    y: currentY + 4,
    size: 10,
    font: fontBold,
    color: colorIndigo,
  });

  page.drawText('Delivery and all taxes included', {
    x: margin,
    y: currentY - 8,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });

  drawRupeePrice(
    page,
    width - margin,
    currentY - 4,
    data.finalPrice,
    23,
    fontBold,
    colorNavy,
    true
  );

  currentY -= 36;

  // Row E: Advance Token Paid & Balance Due on Delivery (if advance is recorded)
  const advance = data.advanceDeposit || 0;
  if (advance > 0) {
    const balance = Math.max(0, data.finalPrice - advance);

    page.drawText('Advance Token Paid', {
      x: margin,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: colorEmeraldText,
    });

    drawRupeePrice(
      page,
      width - margin,
      currentY,
      advance,
      13,
      fontBold,
      colorEmeraldText,
      true
    );

    currentY -= 20;

    page.drawText('BALANCE DUE ON DELIVERY', {
      x: margin,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: rgb(180 / 255, 83 / 255, 9 / 255),
    });

    drawRupeePrice(
      page,
      width - margin,
      currentY,
      balance,
      15,
      fontBold,
      rgb(180 / 255, 83 / 255, 9 / 255),
      true
    );

    currentY -= 26;
  } else {
    currentY -= 8;
  }

  // 5B. ORDER NOTES / CUSTOMIZATIONS BOX (if provided)
  if (data.orderNotes && data.orderNotes.trim()) {
    const notesH = 34;
    page.drawRectangle({
      x: margin,
      y: currentY - notesH + 4,
      width: contentWidth,
      height: notesH,
      color: colorLightBg,
      borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
      borderWidth: 1,
    });

    page.drawText('Special Customizations / Notes:', {
      x: margin + 14,
      y: currentY - 8,
      size: 7.5,
      font: fontBold,
      color: colorIndigo,
    });

    const noteBody =
      data.orderNotes.trim().length > 95
        ? data.orderNotes.trim().slice(0, 92) + '...'
        : data.orderNotes.trim();

    page.drawText(`"${noteBody}"`, {
      x: margin + 14,
      y: currentY - 20,
      size: 8,
      font: fontRegular,
      color: colorNavy,
    });

    currentY -= notesH + 12;
  } else {
    currentY -= 4;
  }

  // 6. 24-HOUR NOTICE BOX (Amber card matching the image)
  const noticeH = 54;
  page.drawRectangle({
    x: margin,
    y: currentY - noticeH,
    width: contentWidth,
    height: noticeH,
    color: colorAmberBg,
    borderColor: colorAmberBorder,
    borderWidth: 1.5,
  });

  // Orange circle with clock
  const clockCircleRadius = 13;
  page.drawCircle({
    x: margin + 24,
    y: currentY - noticeH / 2,
    size: clockCircleRadius,
    color: rgb(234 / 255, 88 / 255, 12 / 255),
  });

  // Clock hands
  page.drawLine({
    start: { x: margin + 24, y: currentY - noticeH / 2 },
    end: { x: margin + 24, y: currentY - noticeH / 2 + 6 },
    thickness: 1.5,
    color: colorWhite,
  });
  page.drawLine({
    start: { x: margin + 24, y: currentY - noticeH / 2 },
    end: { x: margin + 29, y: currentY - noticeH / 2 },
    thickness: 1.5,
    color: colorWhite,
  });

  // Notice Title
  const noticeX = margin + 46;
  page.drawText('Notice: Quote Valid for 24 Hours Only', {
    x: noticeX,
    y: currentY - 19,
    size: 10.5,
    font: fontBold,
    color: colorAmberTitle,
  });

  // Valid till pill on right
  const validPillText = `Valid till: ${data.validUntilFormatted}`;
  const validPillW = fontBold.widthOfTextAtSize(validPillText, 7.5) + 14;
  const validPillX = width - margin - 12 - validPillW;
  page.drawRectangle({
    x: validPillX,
    y: currentY - 22,
    width: validPillW,
    height: 15,
    color: rgb(254 / 255, 243 / 255, 199 / 255),
  });

  page.drawText(validPillText, {
    x: validPillX + 7,
    y: currentY - 18,
    size: 7.5,
    font: fontBold,
    color: colorAmberBody,
  });

  // Notice Body
  page.drawText(
    'This quote and price are valid for 24 hours only. These items are reserved for you during',
    {
      x: noticeX,
      y: currentY - 33,
      size: 7.5,
      font: fontRegular,
      color: colorAmberBody,
    }
  );
  page.drawText(
    'this time. No other quote will be generated for these products until 24 hours have passed.',
    {
      x: noticeX,
      y: currentY - 43,
      size: 7.5,
      font: fontRegular,
      color: colorAmberBody,
    }
  );

  currentY -= noticeH + 28;

  // 7. FOOTER CARD (Light grey card matching the image)
  const footerH = 50;
  page.drawRectangle({
    x: margin,
    y: currentY - footerH,
    width: contentWidth,
    height: footerH,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  const thankYouText = 'Thank you for visiting Alishan Furnitures!';
  page.drawText(thankYouText, {
    x: margin + (contentWidth - fontBold.widthOfTextAtSize(thankYouText, 10.5)) / 2,
    y: currentY - 20,
    size: 10.5,
    font: fontBold,
    color: colorNavy,
  });

  const last4 = data.customerWhatsapp.slice(-4);
  const forCustomer = data.customerName?.trim()
    ? `${data.customerName.trim()} (WhatsApp: ••••${last4})`
    : `WhatsApp ending in ••••${last4}`;
  const footerSubText = `This quote was prepared for ${forCustomer}. Please contact us if you need any assistance.`;
  page.drawText(footerSubText, {
    x: margin + (contentWidth - fontRegular.widthOfTextAtSize(footerSubText, 8)) / 2,
    y: currentY - 36,
    size: 8,
    font: fontRegular,
    color: colorSlate,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
