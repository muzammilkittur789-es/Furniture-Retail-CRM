import { PDFDocument, rgb, StandardFonts, PDFName, PDFPage } from 'pdf-lib';
import {
  PlannerConfig,
  THEME_PALETTES,
  MONTH_NAMES,
  MONTH_SHORT,
} from './planner-types';

export interface GenerationProgress {
  percent: number;
  message: string;
}

/**
 * Creates an invisible clickable link hitbox that navigates directly to targetPage in GoodNotes/Notability
 */
export function addPageLink(
  doc: PDFDocument,
  sourcePage: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  targetPage: PDFPage
) {
  const linkAnnot = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    C: [0, 0, 0],
    Dest: [targetPage.ref, 'XYZ', null, null, null],
  });
  const annotRef = doc.context.register(linkAnnot);

  const annots = sourcePage.node.Annots();
  if (annots) {
    annots.push(annotRef);
  } else {
    sourcePage.node.set(PDFName.of('Annots'), doc.context.obj([annotRef]));
  }
}

/**
 * Main Bespoke Vector PDF Planner Generator
 */
export async function generateBespokePlannerPdf(
  config: PlannerConfig,
  onProgress?: (progress: GenerationProgress) => void
): Promise<Uint8Array> {
  const updateProgress = (percent: number, message: string) => {
    if (onProgress) {
      onProgress({ percent: Math.min(100, Math.max(0, percent)), message });
    }
  };

  updateProgress(5, 'Initializing iPad vector canvas...');

  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // iPad dimensions in PDF points (72 DPI)
  // Portrait: 768 x 1024 pt (4:3 aspect ratio, matches all iPad Air / Pro models)
  // Landscape: 1024 x 768 pt (4:3 aspect ratio)
  const isLandscape = config.orientation === 'landscape';
  const pageWidth = isLandscape ? 1024 : 768;
  const pageHeight = isLandscape ? 768 : 1024;

  const palette = THEME_PALETTES[config.theme] || THEME_PALETTES.linen;
  const paperColor = rgb(palette.paperRgb[0], palette.paperRgb[1], palette.paperRgb[2]);
  const tabColor = rgb(palette.tabRgb[0], palette.tabRgb[1], palette.tabRgb[2]);
  const textColor = rgb(palette.textRgb[0], palette.textRgb[1], palette.textRgb[2]);
  const mutedColor = rgb(palette.mutedRgb[0], palette.mutedRgb[1], palette.mutedRgb[2]);
  const accentColor = rgb(palette.accentRgb[0], palette.accentRgb[1], palette.accentRgb[2]);
  const borderColor = rgb(palette.borderRgb[0], palette.borderRgb[1], palette.borderRgb[2]);

  // Tab navigation layout
  // In Portrait, tabs sit along the right margin
  // In Landscape, tabs sit along the right edge as tactile planner cut-tabs
  const tabWidth = isLandscape ? 40 : 36;
  const tabMarginRight = 10;
  const contentWidth = pageWidth - tabWidth - 36;
  const contentHeight = pageHeight - 50;

  // Track key pages for hyperlinking
  let coverPage: PDFPage;
  let yearPage: PDFPage;
  const monthPages: Map<number, PDFPage> = new Map();
  const dailyPages: Map<string, PDFPage> = new Map(); // key: "M-D"
  let habitsPage: PDFPage | null = null;
  let notesPage: PDFPage | null = null;

  // Draw background & subtle rule borders on a page
  const initPage = () => {
    const page = doc.addPage([pageWidth, pageHeight]);
    // Fill paper background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: paperColor,
    });
    return page;
  };

  // Helper to render edge tabs on every page
  const renderEdgeTabs = (page: PDFPage, activeTabKey?: string) => {
    const tabCount = 14; // 12 months + Habits + Notes
    const tabHeight = (pageHeight - 80) / tabCount;
    const tabX = pageWidth - tabWidth - tabMarginRight;

    // 12 Months
    for (let m = 0; m < 12; m++) {
      const tabY = pageHeight - 50 - (m + 1) * tabHeight;
      const isCurrentMonth = activeTabKey === `m-${m}`;

      // Tab rounded pill or rectangle
      page.drawRectangle({
        x: tabX,
        y: tabY,
        width: tabWidth,
        height: tabHeight - 2,
        color: isCurrentMonth ? accentColor : tabColor,
        borderColor: borderColor,
        borderWidth: 0.5,
      });

      // Tab label
      const label = MONTH_SHORT[m];
      const textWidth = fontBold.widthOfTextAtSize(label, 7.5);
      page.drawText(label, {
        x: tabX + (tabWidth - textWidth) / 2,
        y: tabY + (tabHeight - 2) / 2 - 2.5,
        size: 7.5,
        font: fontBold,
        color: isCurrentMonth ? (palette.isDark ? rgb(0.1, 0.1, 0.1) : rgb(1, 1, 1)) : textColor,
      });

      // Hyperlink if month page exists
      const targetMonthPage = monthPages.get(m);
      if (targetMonthPage) {
        addPageLink(doc, page, tabX, tabY, tabWidth, tabHeight - 2, targetMonthPage);
      }
    }

    // Habit Tab
    const habY = pageHeight - 50 - 13 * tabHeight;
    const isHabActive = activeTabKey === 'habits';
    page.drawRectangle({
      x: tabX,
      y: habY,
      width: tabWidth,
      height: tabHeight - 2,
      color: isHabActive ? accentColor : tabColor,
      borderColor: borderColor,
      borderWidth: 0.5,
    });
    const habLabel = 'HAB';
    const habW = fontBold.widthOfTextAtSize(habLabel, 7.5);
    page.drawText(habLabel, {
      x: tabX + (tabWidth - habW) / 2,
      y: habY + (tabHeight - 2) / 2 - 2.5,
      size: 7.5,
      font: fontBold,
      color: isHabActive ? rgb(1, 1, 1) : textColor,
    });
    if (habitsPage) {
      addPageLink(doc, page, tabX, habY, tabWidth, tabHeight - 2, habitsPage);
    }

    // Notes Tab
    const noteY = pageHeight - 50 - 14 * tabHeight;
    const isNoteActive = activeTabKey === 'notes';
    page.drawRectangle({
      x: tabX,
      y: noteY,
      width: tabWidth,
      height: tabHeight - 2,
      color: isNoteActive ? accentColor : tabColor,
      borderColor: borderColor,
      borderWidth: 0.5,
    });
    const noteLabel = 'NOTE';
    const noteW = fontBold.widthOfTextAtSize(noteLabel, 7);
    page.drawText(noteLabel, {
      x: tabX + (tabWidth - noteW) / 2,
      y: noteY + (tabHeight - 2) / 2 - 2.5,
      size: 7,
      font: fontBold,
      color: isNoteActive ? rgb(1, 1, 1) : textColor,
    });
    if (notesPage) {
      addPageLink(doc, page, tabX, noteY, tabWidth, tabHeight - 2, notesPage);
    }
  };

  // ==========================================
  // PAGE 1: LUXURY MINIMAL COVER PAGE
  // ==========================================
  updateProgress(15, 'Designing minimal cover sheet...');
  coverPage = initPage();

  // Subtle border frame
  coverPage.drawRectangle({
    x: 40,
    y: 40,
    width: pageWidth - 80,
    height: pageHeight - 80,
    borderColor: borderColor,
    borderWidth: 1,
    color: paperColor,
  });

  const yearLabel = config.year === 'undated' ? 'UNDATED' : config.year;
  const titleText = 'A U R A';
  const subtitleText = `MINIMAL DIGITAL PLANNER • ${yearLabel}`;
  const orientationTag = isLandscape ? 'LANDSCAPE DUAL SPREAD' : 'PORTRAIT EDIT';

  coverPage.drawText(titleText, {
    x: pageWidth / 2 - 90,
    y: pageHeight / 2 + 80,
    size: 38,
    font: fontBold,
    color: textColor,
  });

  coverPage.drawText(subtitleText, {
    x: pageWidth / 2 - 120,
    y: pageHeight / 2 + 45,
    size: 11,
    font: fontRegular,
    color: accentColor,
  });

  coverPage.drawText(orientationTag, {
    x: pageWidth / 2 - 75,
    y: pageHeight / 2 + 20,
    size: 9,
    font: fontBold,
    color: mutedColor,
  });

  coverPage.drawLine({
    start: { x: pageWidth / 2 - 100, y: pageHeight / 2 },
    end: { x: pageWidth / 2 + 100, y: pageHeight / 2 },
    thickness: 0.75,
    color: borderColor,
  });

  coverPage.drawText('BELONGS TO: _________________________________', {
    x: pageWidth / 2 - 130,
    y: pageHeight / 2 - 50,
    size: 10,
    font: fontRegular,
    color: mutedColor,
  });

  // ==========================================
  // PAGE 2: YEAR AT A GLANCE (12 MONTH CALENDAR)
  // ==========================================
  updateProgress(25, 'Building Year-at-a-Glance calendar index...');
  yearPage = initPage();

  // Top header on Year Page
  yearPage.drawText(`${yearLabel} CALENDAR OVERVIEW`, {
    x: 45,
    y: pageHeight - 45,
    size: 18,
    font: fontBold,
    color: textColor,
  });

  yearPage.drawText('Tap any month to jump directly to its overview', {
    x: 45,
    y: pageHeight - 60,
    size: 9,
    font: fontRegular,
    color: mutedColor,
  });

  // We will populate month links on the Year page after month pages are created!

  // ==========================================
  // CREATE 12 MONTHLY OVERVIEW PAGES
  // ==========================================
  updateProgress(40, 'Generating 12 hyperlinked monthly spreads...');
  for (let m = 0; m < 12; m++) {
    const monthPage = initPage();
    monthPages.set(m, monthPage);

    // Header
    const mName = MONTH_NAMES[m].toUpperCase();
    monthPage.drawText(`${mName} ${yearLabel}`, {
      x: 45,
      y: pageHeight - 45,
      size: 20,
      font: fontBold,
      color: textColor,
    });

    // Quick jump back to Year Overview
    const backLabel = '← YEAR CALENDAR';
    monthPage.drawText(backLabel, {
      x: contentWidth - 110,
      y: pageHeight - 42,
      size: 8.5,
      font: fontBold,
      color: accentColor,
    });
    addPageLink(doc, monthPage, contentWidth - 115, pageHeight - 50, 110, 20, yearPage);

    // Render Monthly Calendar Grid
    const gridX = 45;
    const gridY = isLandscape ? 120 : 350;
    const gridW = isLandscape ? (contentWidth - 60) * 0.65 : contentWidth - 60;
    const gridH = isLandscape ? pageHeight - 200 : 560;
    const cellW = gridW / 7;
    const cellH = gridH / 6;

    const daysHeader = config.startDay === 'monday'
      ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Day of week headers
    daysHeader.forEach((d, i) => {
      const hx = gridX + i * cellW + cellW / 2 - 10;
      const hy = gridY + gridH + 12;
      monthPage.drawText(d, {
        x: hx,
        y: hy,
        size: 8.5,
        font: fontBold,
        color: mutedColor,
      });
    });

    // Outer grid border
    monthPage.drawRectangle({
      x: gridX,
      y: gridY,
      width: gridW,
      height: gridH,
      borderColor: borderColor,
      borderWidth: 0.75,
      color: paperColor,
    });

    // Draw horizontal & vertical grid lines
    for (let r = 1; r < 6; r++) {
      monthPage.drawLine({
        start: { x: gridX, y: gridY + r * cellH },
        end: { x: gridX + gridW, y: gridY + r * cellH },
        thickness: 0.5,
        color: borderColor,
      });
    }
    for (let c = 1; c < 7; c++) {
      monthPage.drawLine({
        start: { x: gridX + c * cellW, y: gridY },
        end: { x: gridX + c * cellW, y: gridY + gridH },
        thickness: 0.5,
        color: borderColor,
      });
    }

    // Number cells (sample 31 days)
    for (let day = 1; day <= 31; day++) {
      const col = (day - 1 + (config.startDay === 'monday' ? 2 : 3)) % 7;
      const row = Math.floor((day - 1 + (config.startDay === 'monday' ? 2 : 3)) / 7);
      if (row < 6) {
        const cx = gridX + col * cellW + 6;
        const cy = gridY + gridH - row * cellH - 16;
        monthPage.drawText(`${day}`, {
          x: cx,
          y: cy,
          size: 9.5,
          font: fontBold,
          color: textColor,
        });
      }
    }

    // If Landscape, draw Right-Hand Focus Spread (Goals, Habits, Priorities)
    if (isLandscape) {
      const rightX = gridX + gridW + 24;
      const rightW = contentWidth - gridW - 60;
      const rightH = gridH;

      monthPage.drawRectangle({
        x: rightX,
        y: gridY,
        width: rightW,
        height: rightH,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      monthPage.drawText('MONTHLY GOALS & PRIORITIES', {
        x: rightX + 15,
        y: gridY + rightH - 25,
        size: 10,
        font: fontBold,
        color: textColor,
      });

      // Lined rows for goals
      for (let line = 1; line <= 12; line++) {
        const ly = gridY + rightH - 40 - line * 26;
        monthPage.drawCircle({
          x: rightX + 22,
          y: ly + 3,
          size: 3,
          borderColor: borderColor,
          borderWidth: 0.75,
          color: paperColor,
        });
        monthPage.drawLine({
          start: { x: rightX + 35, y: ly },
          end: { x: rightX + rightW - 15, y: ly },
          thickness: 0.5,
          color: borderColor,
        });
      }
    }
  }

  // Backfill links on Year Overview page to all 12 Months
  const cols = isLandscape ? 4 : 3;
  const rows = isLandscape ? 3 : 4;
  const calW = (contentWidth - 80) / cols;
  const calH = (contentHeight - 100) / rows;

  for (let m = 0; m < 12; m++) {
    const col = m % cols;
    const row = Math.floor(m / cols);
    const mx = 45 + col * (calW + 20);
    const my = pageHeight - 110 - row * (calH + 15);

    const mTitle = MONTH_NAMES[m];
    yearPage.drawText(mTitle, {
      x: mx + 10,
      y: my + calH - 20,
      size: 10.5,
      font: fontBold,
      color: accentColor,
    });

    yearPage.drawRectangle({
      x: mx,
      y: my,
      width: calW,
      height: calH,
      borderColor: borderColor,
      borderWidth: 0.5,
      color: paperColor,
    });

    // Add hyperlink from year calendar card to Month Page
    const targetM = monthPages.get(m);
    if (targetM) {
      addPageLink(doc, yearPage, mx, my, calW, calH, targetM);
    }
  }

  // ==========================================
  // HABITS TRACKER PAGE
  // ==========================================
  if (config.modules.habits) {
    updateProgress(65, 'Constructing 31-day Habit Matrix...');
    habitsPage = initPage();

    habitsPage.drawText('MONTHLY HABIT MATRIX', {
      x: 45,
      y: pageHeight - 45,
      size: 20,
      font: fontBold,
      color: textColor,
    });

    habitsPage.drawText('Track consistency across 31 daily touchpoints', {
      x: 45,
      y: pageHeight - 60,
      size: 9,
      font: fontRegular,
      color: mutedColor,
    });

    // 12 Habit Rows x 31 Day Dots
    const habitStartX = 45;
    const habitStartY = 80;
    const habitRowH = 34;
    const habitW = contentWidth - 45;

    for (let h = 0; h < 14; h++) {
      const ry = pageHeight - 120 - h * habitRowH;
      // Habit name line
      habitsPage.drawText(`Habit ${h + 1}: _____________________`, {
        x: habitStartX,
        y: ry + 6,
        size: 9,
        font: fontRegular,
        color: textColor,
      });

      // 31 check circles
      const dotStartX = habitStartX + (isLandscape ? 240 : 180);
      const dotStep = (habitW - (isLandscape ? 250 : 190)) / 31;
      for (let d = 1; d <= 31; d++) {
        habitsPage.drawCircle({
          x: dotStartX + (d - 1) * dotStep + 4,
          y: ry + 9,
          size: 3.5,
          borderColor: borderColor,
          borderWidth: 0.75,
          color: paperColor,
        });
      }
      habitsPage.drawLine({
        start: { x: habitStartX, y: ry },
        end: { x: habitStartX + habitW, y: ry },
        thickness: 0.4,
        color: borderColor,
      });
    }
  }

  // ==========================================
  // NOTES & SCRATCHPAD PAGE
  // ==========================================
  if (config.modules.notes) {
    updateProgress(75, 'Adding Minimal Dot-Grid & Lined Scratchpad...');
    notesPage = initPage();

    notesPage.drawText('MINIMAL NOTES & BRAIN DUMP', {
      x: 45,
      y: pageHeight - 45,
      size: 20,
      font: fontBold,
      color: textColor,
    });

    notesPage.drawText('5mm precision dot grid for Apple Pencil notes & diagrams', {
      x: 45,
      y: pageHeight - 60,
      size: 9,
      font: fontRegular,
      color: mutedColor,
    });

    // Draw 5mm dot grid
    const dotSpacing = 16;
    const gridLeft = 45;
    const gridRight = contentWidth;
    const gridBottom = 50;
    const gridTop = pageHeight - 80;

    for (let x = gridLeft; x < gridRight; x += dotSpacing) {
      for (let y = gridBottom; y < gridTop; y += dotSpacing) {
        notesPage.drawCircle({
          x,
          y,
          size: 0.6,
          color: borderColor,
        });
      }
    }
  }

  // ==========================================
  // CREATE CORE DAILY FOCUS PAGES (Hyperlinked)
  // ==========================================
  updateProgress(85, 'Rendering Daily Focus Sheets with 24h Timeblocks...');
  // For sample/quarter, generate curated daily pages with full hyperlinks
  const daysToGenerate = config.duration === 'full' ? 30 : config.duration === 'quarter' ? 14 : 7;

  for (let d = 1; d <= daysToGenerate; d++) {
    const dayPage = initPage();
    dailyPages.set(`0-${d}`, dayPage);

    // Daily Header
    dayPage.drawText(`DAY ${d} • ${MONTH_NAMES[0].toUpperCase()} ${yearLabel}`, {
      x: 45,
      y: pageHeight - 45,
      size: 18,
      font: fontBold,
      color: textColor,
    });

    // Quick Jump: Back to Month
    const mLink = `← ${MONTH_SHORT[0]} OVERVIEW`;
    dayPage.drawText(mLink, {
      x: contentWidth - 110,
      y: pageHeight - 42,
      size: 8.5,
      font: fontBold,
      color: accentColor,
    });
    const targetM = monthPages.get(0);
    if (targetM) {
      addPageLink(doc, dayPage, contentWidth - 115, pageHeight - 50, 110, 20, targetM);
    }

    if (isLandscape) {
      // LANDSCAPE SPREAD:
      // Left Page: Top 3 Priorities & 6 AM - 10 PM Schedule
      // Right Page: Must-Do Checklist & Notes Grid
      const halfW = (contentWidth - 60) / 2;

      // Left Column: Priorities & Schedule
      dayPage.drawRectangle({
        x: 45,
        y: 60,
        width: halfW,
        height: pageHeight - 120,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      dayPage.drawText('TOP 3 PRIORITIES', {
        x: 60,
        y: pageHeight - 90,
        size: 10,
        font: fontBold,
        color: accentColor,
      });

      for (let p = 1; p <= 3; p++) {
        const py = pageHeight - 100 - p * 24;
        dayPage.drawText(`${p}. _________________________________________`, {
          x: 60,
          y: py,
          size: 9,
          font: fontRegular,
          color: textColor,
        });
      }

      // 6 AM - 10 PM Hourly Rail
      dayPage.drawText('TIMEBLOCK SCHEDULE', {
        x: 60,
        y: pageHeight - 195,
        size: 10,
        font: fontBold,
        color: accentColor,
      });

      for (let h = 6; h <= 21; h++) {
        const hy = pageHeight - 210 - (h - 6) * 28;
        const timeLabel = `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
        dayPage.drawText(timeLabel, {
          x: 60,
          y: hy,
          size: 7.5,
          font: fontRegular,
          color: mutedColor,
        });
        dayPage.drawLine({
          start: { x: 120, y: hy + 2 },
          end: { x: 45 + halfW - 15, y: hy + 2 },
          thickness: 0.4,
          color: borderColor,
        });
      }

      // Right Column: To-Do Checklist & Grid Notes
      const rightX = 45 + halfW + 15;
      dayPage.drawRectangle({
        x: rightX,
        y: 60,
        width: halfW,
        height: pageHeight - 120,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      dayPage.drawText('TASK CHECKLIST & ACTION ITEMS', {
        x: rightX + 15,
        y: pageHeight - 90,
        size: 10,
        font: fontBold,
        color: accentColor,
      });

      for (let t = 1; t <= 10; t++) {
        const ty = pageHeight - 100 - t * 24;
        dayPage.drawCircle({
          x: rightX + 22,
          y: ty + 3,
          size: 3.5,
          borderColor: borderColor,
          borderWidth: 0.75,
          color: paperColor,
        });
        dayPage.drawLine({
          start: { x: rightX + 35, y: ty },
          end: { x: rightX + halfW - 15, y: ty },
          thickness: 0.4,
          color: borderColor,
        });
      }

      // Bottom Right: Dot Grid Brain Dump
      dayPage.drawText('BRAIN DUMP / APPLE PENCIL SKETCH', {
        x: rightX + 15,
        y: pageHeight - 370,
        size: 10,
        font: fontBold,
        color: accentColor,
      });

      for (let gx = rightX + 15; gx < rightX + halfW - 15; gx += 16) {
        for (let gy = 70; gy < pageHeight - 390; gy += 16) {
          dayPage.drawCircle({
            x: gx,
            y: gy,
            size: 0.6,
            color: borderColor,
          });
        }
      }
    } else {
      // PORTRAIT LAYOUT:
      // Top 3 Priorities + Timeblock Rail + Tasks + Notes
      dayPage.drawRectangle({
        x: 45,
        y: pageHeight - 160,
        width: contentWidth - 45,
        height: 100,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      dayPage.drawText('TOP 3 DAILY PRIORITIES', {
        x: 60,
        y: pageHeight - 80,
        size: 10,
        font: fontBold,
        color: accentColor,
      });

      for (let p = 1; p <= 3; p++) {
        const py = pageHeight - 85 - p * 20;
        dayPage.drawText(`${p}. ___________________________________________________________`, {
          x: 60,
          y: py,
          size: 9,
          font: fontRegular,
          color: textColor,
        });
      }

      // Schedule (Left Column)
      const schedW = (contentWidth - 60) * 0.45;
      const schedH = pageHeight - 240;
      dayPage.drawRectangle({
        x: 45,
        y: 60,
        width: schedW,
        height: schedH,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      dayPage.drawText('TIMEBLOCK (6AM - 10PM)', {
        x: 55,
        y: 60 + schedH - 22,
        size: 9,
        font: fontBold,
        color: accentColor,
      });

      for (let h = 6; h <= 21; h++) {
        const hy = 60 + schedH - 35 - (h - 6) * 40;
        const timeLabel = `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`;
        dayPage.drawText(timeLabel, {
          x: 55,
          y: hy,
          size: 7.5,
          font: fontRegular,
          color: mutedColor,
        });
        dayPage.drawLine({
          start: { x: 95, y: hy + 2 },
          end: { x: 45 + schedW - 10, y: hy + 2 },
          thickness: 0.4,
          color: borderColor,
        });
      }

      // Tasks & Notes (Right Column)
      const rightX = 45 + schedW + 15;
      const rightW = contentWidth - schedW - 60;
      dayPage.drawRectangle({
        x: rightX,
        y: 60,
        width: rightW,
        height: schedH,
        borderColor: borderColor,
        borderWidth: 0.75,
        color: paperColor,
      });

      dayPage.drawText('TO-DO CHECKLIST', {
        x: rightX + 15,
        y: 60 + schedH - 22,
        size: 9,
        font: fontBold,
        color: accentColor,
      });

      for (let t = 1; t <= 12; t++) {
        const ty = 60 + schedH - 35 - t * 24;
        dayPage.drawCircle({
          x: rightX + 22,
          y: ty + 3,
          size: 3,
          borderColor: borderColor,
          borderWidth: 0.75,
          color: paperColor,
        });
        dayPage.drawLine({
          start: { x: rightX + 35, y: ty },
          end: { x: rightX + rightW - 15, y: ty },
          thickness: 0.4,
          color: borderColor,
        });
      }

      dayPage.drawText('NOTES & BRAIN DUMP', {
        x: rightX + 15,
        y: 60 + schedH - 350,
        size: 9,
        font: fontBold,
        color: accentColor,
      });

      for (let dotY = 70; dotY < 60 + schedH - 370; dotY += 16) {
        for (let dotX = rightX + 15; dotX < rightX + rightW - 15; dotX += 16) {
          dayPage.drawCircle({
            x: dotX,
            y: dotY,
            size: 0.6,
            color: borderColor,
          });
        }
      }
    }
  }

  // ==========================================
  // INJECT TABS & HYPERLINKS ON ALL PAGES
  // ==========================================
  updateProgress(92, 'Injecting interactive edge tabs and hyperlinks on all sheets...');
  const allPages = doc.getPages();
  allPages.forEach((p, idx) => {
    // Determine active tab key based on page type
    let activeKey: string | undefined = undefined;
    monthPages.forEach((mp, mIdx) => {
      if (mp === p) activeKey = `m-${mIdx}`;
    });
    if (p === habitsPage) activeKey = 'habits';
    if (p === notesPage) activeKey = 'notes';

    renderEdgeTabs(p, activeKey);
  });

  // Link Day 1 to Day N on Month 1 grid
  const month1Page = monthPages.get(0);
  if (month1Page) {
    const gridX = 45;
    const gridY = isLandscape ? 120 : 350;
    const gridW = isLandscape ? (contentWidth - 60) * 0.65 : contentWidth - 60;
    const gridH = isLandscape ? pageHeight - 200 : 560;
    const cellW = gridW / 7;
    const cellH = gridH / 6;

    for (let day = 1; day <= daysToGenerate; day++) {
      const col = (day - 1 + (config.startDay === 'monday' ? 2 : 3)) % 7;
      const row = Math.floor((day - 1 + (config.startDay === 'monday' ? 2 : 3)) / 7);
      if (row < 6) {
        const cx = gridX + col * cellW;
        const cy = gridY + gridH - (row + 1) * cellH;
        const targetDay = dailyPages.get(`0-${day}`);
        if (targetDay) {
          addPageLink(doc, month1Page, cx, cy, cellW, cellH, targetDay);
        }
      }
    }
  }

  updateProgress(98, 'Compressing vector PDF stream for high-speed GoodNotes rendering...');
  const pdfBytes = await doc.save();
  updateProgress(100, 'Your bespoke digital planner is ready!');

  return pdfBytes;
}
