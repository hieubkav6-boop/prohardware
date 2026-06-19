import React from "react";
import { CVData, CVSettings } from "../types/cv";
import {
  ModernMinimalistTemplate,
  ProfessionalEditorialTemplate,
  CreativeTechnicalTemplate,
  ElegantExecutiveTemplate,
  TechnicalMinimalistTemplate,
  BoldEditorialTemplate,
  MinimalistBorderedTemplate,
  SidebarColumnsTemplate,
  RetroTypographicTemplate,
  ModernAccentGridTemplate,
  getFontFamily,
} from "./CVTemplates";

interface CVPreviewProps {
  data: CVData;
  settings: CVSettings;
  zoom: number; // e.g., 0.6, 0.8, 1.0
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data, settings, zoom }) => {
  const isPortrait = settings.orientation === "portrait";
  const widthMm = isPortrait ? 210 : 297;
  const heightMm = isPortrait ? 297 : 210;

  const renderTemplate = () => {
    switch (settings.template) {
      case "modern":
        return <ModernMinimalistTemplate data={data} settings={settings} />;
      case "professional":
        return <ProfessionalEditorialTemplate data={data} settings={settings} />;
      case "creative":
        return <CreativeTechnicalTemplate data={data} settings={settings} />;
      case "elegant":
        return <ElegantExecutiveTemplate data={data} settings={settings} />;
      case "technical":
        return <TechnicalMinimalistTemplate data={data} settings={settings} />;
      case "bold":
        return <BoldEditorialTemplate data={data} settings={settings} />;
      case "bordered":
        return <MinimalistBorderedTemplate data={data} settings={settings} />;
      case "sidebar":
        return <SidebarColumnsTemplate data={data} settings={settings} />;
      case "retro":
        return <RetroTypographicTemplate data={data} settings={settings} />;
      case "accent":
        return <ModernAccentGridTemplate data={data} settings={settings} />;
      default:
        return <ModernMinimalistTemplate data={data} settings={settings} />;
    }
  };
  const [numPages, setNumPages] = React.useState(1);
  const printAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const measureHeight = () => {
      if (printAreaRef.current) {
        // Save current style values
        const originalHeight = printAreaRef.current.style.height;
        // Temporarily set height to auto to measure natural scrollHeight
        printAreaRef.current.style.height = "auto";
        
        // Get padding settings dynamically
        const computedStyle = window.getComputedStyle(printAreaRef.current);
        const paddingTopPx = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottomPx = parseFloat(computedStyle.paddingBottom) || 0;

        // Reset all page break margins first to evaluate raw unshifted layout positions
        const avoidBreaks = printAreaRef.current.querySelectorAll<HTMLElement>(".avoid-break");
        avoidBreaks.forEach((el) => {
          el.style.marginTop = "";
        });

        // Clear any previous section shifts
        const sections = printAreaRef.current.querySelectorAll<HTMLElement>("section");
        sections.forEach((el) => {
          el.style.marginTop = "";
        });

        // Temporarily hide overlays and page numbers to prevent them from extending scrollHeight
        const overlays = printAreaRef.current.querySelectorAll<HTMLElement>(".page-break-overlay");
        overlays.forEach((el) => {
          el.style.display = "none";
        });
        const pageNumbers = printAreaRef.current.querySelectorAll<HTMLElement>(".cv-page-number");
        pageNumbers.forEach((el) => {
          el.style.display = "none";
        });

        // Trigger reflow to let the browser recalculate unshifted positions
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        printAreaRef.current.offsetHeight;

        const offsetWidth = printAreaRef.current.offsetWidth || 1;
        const pxPerMm = offsetWidth / widthMm;
        const pageHeightPx = heightMm * pxPerMm;
        const printableHeight = pageHeightPx - paddingTopPx - paddingBottomPx;

        const containerRect = printAreaRef.current.getBoundingClientRect();
        const actualZoom = containerRect.width / offsetWidth || 1;

        // 1. Pass 1: Section-level keep-together.
        // If a section fits entirely on one page but is split across a boundary, push the whole section.
        sections.forEach((sec) => {
          const secRect = sec.getBoundingClientRect();
          const secTop = (secRect.top - containerRect.top) / actualZoom;
          const secBottom = (secRect.bottom - containerRect.top) / actualZoom;
          const secHeight = secBottom - secTop;

          if (secHeight > 0 && secHeight < printableHeight) {
            const pageIndex = Math.floor(secTop / pageHeightPx);
            const maxY = (pageIndex + 1) * pageHeightPx - paddingBottomPx;

            if (secBottom > maxY) {
              const nextPageMinY = (pageIndex + 1) * pageHeightPx + paddingTopPx;
              const pushPx = nextPageMinY - secTop;
              if (pushPx > 0) {
                const secStyle = window.getComputedStyle(sec);
                const naturalMarginTop = parseFloat(secStyle.marginTop) || 0;
                sec.style.marginTop = `${naturalMarginTop + pushPx}px`;
              }
            }
          }
        });

        // 2. Pass 2: Item-level keep-together (for cards inside split sections).
        avoidBreaks.forEach((el) => {
          const elRect = el.getBoundingClientRect();
          // Convert viewport-space rect (which includes zoom scale) to layout-space
          const relativeTop = (elRect.top - containerRect.top) / actualZoom;
          const relativeBottom = (elRect.bottom - containerRect.top) / actualZoom;
          const elHeight = relativeBottom - relativeTop;

          // Only apply pagination pushes if the block actually fits on a single page
          if (elHeight > 0 && elHeight < printableHeight) {
            const pageIndex = Math.floor(relativeTop / pageHeightPx);
            const minY = pageIndex * pageHeightPx + paddingTopPx;
            const maxY = (pageIndex + 1) * pageHeightPx - paddingBottomPx;

            let pushPx = 0;
            if (relativeTop < minY) {
              // Started inside the top margin of the current page
              pushPx = minY - relativeTop;
            } else if (relativeBottom > maxY) {
              // Crossed the bottom margin boundary of the current page, push to next page top
              const nextPageMinY = (pageIndex + 1) * pageHeightPx + paddingTopPx;
              pushPx = nextPageMinY - relativeTop;
            }

            if (pushPx > 0) {
              const elStyle = window.getComputedStyle(el);
              const naturalMarginTop = parseFloat(elStyle.marginTop) || 0;
              el.style.marginTop = `${naturalMarginTop + pushPx}px`;
            }
          }
        });

        // Measure layout scrollHeight after pagination margins have been applied
        const scrollHeight = printAreaRef.current.scrollHeight;
        
        // Restore overlays and page numbers visibility
        overlays.forEach((el) => {
          el.style.display = "";
        });
        pageNumbers.forEach((el) => {
          el.style.display = "";
        });

        // Restore height style
        printAreaRef.current.style.height = originalHeight;
        
        const calculatedHeightMm = (scrollHeight / offsetWidth) * widthMm;
        // Use a 4mm tolerance to prevent rounding errors or tiny subpixel overflows from creating blank pages
        const pages = Math.max(1, Math.ceil((calculatedHeightMm - 4) / heightMm));
        
        if (pages !== numPages) {
          setNumPages(pages);
        }
      }
    };

    measureHeight();

    // Re-run once fonts are fully loaded to prevent layout shifts
    if (typeof window !== "undefined" && typeof document !== "undefined" && document.fonts) {
      void document.fonts.ready.then(() => {
        measureHeight();
      });
    }

    // Run again after a small timeout to let initial browser render stabilize
    const timeoutId = setTimeout(measureHeight, 150);
    return () => clearTimeout(timeoutId);
  }, [data, settings, widthMm, heightMm, numPages, zoom]);


  return (
    <div
      className="flex justify-center items-start w-full no-print bg-slate-800 py-6 overflow-auto custom-scrollbar"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <div
        style={{
          width: `${widthMm * zoom}mm`,
          height: `${heightMm * numPages * zoom}mm`,
          transition: "width 0.2s, height 0.2s",
        }}
        className="flex justify-center items-start overflow-hidden relative"
      >
        <div
          id="cv-print-area"
          ref={printAreaRef}
          style={{
            width: `${widthMm}mm`,
            height: `${heightMm * numPages}mm`,
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.2s",
          }}
          className={`a4-page ${
            isPortrait ? "a4-portrait" : "a4-landscape"
          } bg-white shadow-2xl select-none flex-shrink-0 relative`}
        >
          {renderTemplate()}

          {/* Visual page break overlay gaps for screen preview */}
          {numPages > 1 &&
            Array.from({ length: numPages - 1 }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <div
                  key={pageNum}
                  style={{
                    position: "absolute",
                    top: `calc(${pageNum * heightMm}mm - 6mm)`,
                    height: "12mm",
                    left: 0,
                    right: 0,
                    backgroundColor: "#1e293b", // Matches bg-slate-800 workspace
                    borderTop: "1px solid #cbd5e1",
                    borderBottom: "1px solid #cbd5e1",
                    boxShadow: "inset 0 5px 5px -3px rgba(0,0,0,0.3), inset 0 -5px 5px -3px rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                  className="page-break-overlay no-print"
                />
              );
            })}

          {/* Page numbers for screen preview & PDF export */}
          {numPages > 1 &&
            Array.from({ length: numPages }).map((_, index) => {
              const pageNum = index + 1;
              const paddingBottomMm = isPortrait ? 12 : 10;
              return (
                <div
                  key={`page-num-${pageNum}`}
                  style={{
                    position: "absolute",
                    top: `calc(${pageNum * heightMm}mm - ${paddingBottomMm}mm)`,
                    height: `${paddingBottomMm}mm`,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: "#94a3b8",
                    fontFamily: getFontFamily(settings.fontFamily),
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                  className="cv-page-number"
                >
                  <span>Trang {pageNum} / {numPages}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Off-screen duplicate for printing - matches exactly A4 size at scale 1, no zoom transforms. */}
      <div className="absolute -left-[9999px] -top-[9999px] print:relative print:left-0 print:top-0 print:block print-container w-full">
        <div
          className={`a4-page ${
            isPortrait ? "a4-portrait" : "a4-landscape"
          } bg-white ${!isPortrait ? "landscape-print-page" : ""}`}
          style={{
            width: `${widthMm}mm`,
            height: `${heightMm * numPages}mm`,
            padding: isPortrait ? "12mm" : "10mm 12mm",
            position: "relative",
          }}
        >
          {renderTemplate()}

          {/* Page numbers for browser printing */}
          {numPages > 1 &&
            Array.from({ length: numPages }).map((_, index) => {
              const pageNum = index + 1;
              const paddingBottomMm = isPortrait ? 12 : 10;
              return (
                <div
                  key={`print-page-num-${pageNum}`}
                  style={{
                    position: "absolute",
                    top: `calc(${pageNum * heightMm}mm - ${paddingBottomMm}mm)`,
                    height: `${paddingBottomMm}mm`,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: "#94a3b8",
                    fontFamily: getFontFamily(settings.fontFamily),
                    pointerEvents: "none",
                  }}
                  className="cv-page-number"
                >
                  <span>Trang {pageNum} / {numPages}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default CVPreview;
