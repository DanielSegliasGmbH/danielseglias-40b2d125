import { useRef, useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PdfExportWrapperProps {
  children: ReactNode;
  /** Name used in the PDF filename, e.g. "Inflationsrechner" */
  toolName: string;
  /** Hide the export button (e.g. in public mode) */
  hideExport?: boolean;
}

function getFormattedDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function PdfExportWrapper({ children, toolName, hideExport }: PdfExportWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!contentRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const el = contentRef.current;

      // Temporarily add print-mode class for cleaner capture
      el.classList.add('pdf-export-mode');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Hide interactive-only elements in the clone
          const hideSelectors = [
            '[data-pdf-hide]',
            '.pdf-hide',
          ];
          hideSelectors.forEach(sel => {
            clonedDoc.querySelectorAll(sel).forEach(node => {
              (node as HTMLElement).style.display = 'none';
            });
          });
          // Ensure full width rendering
          const root = clonedDoc.querySelector('[data-pdf-content]') as HTMLElement;
          if (root) {
            root.style.width = '1200px';
            root.style.maxWidth = '1200px';
          }
        },
      });

      el.classList.remove('pdf-export-mode');

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgW = canvas.width;
      const imgH = canvas.height;

      // A4 landscape dimensions in mm
      const pdfW = 297;
      const pdfH = 210;
      const margin = 12;
      const usableW = pdfW - 2 * margin;
      const usableH = pdfH - 2 * margin - 10; // leave room for footer

      // Scale image to fit page width
      const ratio = usableW / (imgW / 2); // html2canvas scale=2
      const scaledImgH = (imgH / 2) * ratio;

      // Calculate how many pages we need
      const totalPages = Math.ceil(scaledImgH / usableH);

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();

        // Source crop from canvas
        const srcY = page * (usableH / ratio) * 2; // multiply by scale
        const srcH = Math.min((usableH / ratio) * 2, imgH - srcY);
        if (srcH <= 0) break;

        // Create a cropped canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgW;
        pageCanvas.height = Math.round(srcH);
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) break;
        ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        const renderH = (srcH / 2) * ratio;

        doc.addImage(pageImgData, 'JPEG', margin, margin, usableW, renderH);

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `${toolName} – Daniel Seglias GmbH | Seite ${page + 1} von ${totalPages}`,
          pdfW / 2,
          pdfH - 6,
          { align: 'center' }
        );
      }

      doc.save(`${toolName.replace(/\s+/g, '-')}_${getFormattedDate()}.pdf`);
      toast.success('PDF erfolgreich erstellt');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('PDF-Export fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {!hideExport && (
        <div className="flex justify-end mb-4 pdf-hide">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                PDF wird erstellt…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                PDF exportieren
              </>
            )}
          </Button>
        </div>
      )}
      <div ref={contentRef} data-pdf-content>
        {children}
      </div>
    </div>
  );
}
