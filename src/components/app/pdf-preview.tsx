
"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download } from "lucide-react";
import type { Locale } from "@/lib/i18n-config";

type PDFPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  dictionary: any;
  lang: Locale;
  onConfirm: () => void;
  isSubmitting: boolean;
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold font-headline mt-6 mb-3 text-primary-foreground/90">{children}</h2>
);

const InfoRow = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="font-semibold text-sm text-muted-foreground">{label}:</span>
    <span className="text-sm text-right">{value || "N/A"}</span>
  </div>
);

const ParticipantPDFSection = ({ participant, dictionary, title, locale }: { participant: any, dictionary: any, title: string, locale: Locale }) => {
  const dateLocale = locale === 'es' ? es : enUS;
  const age = participant.dob ? `${format(participant.dob, "PPP", { locale: dateLocale })} (${new Date().getFullYear() - new Date(participant.dob).getFullYear()} ${dictionary.participantCard.yearsOld})` : 'N/A';
  const maritalStatusKey = participant.maritalStatus?.toLowerCase().replace(' (civil)', '_civil').replace(' ', '_');
  const gender = title === dictionary.groom ? 'male' : 'female';
  const localizedMaritalStatus = dictionary.participantCard.maritalStatusOptions[`${maritalStatusKey}_${gender}`] || participant.maritalStatus;

  const getSacramentDate = (sacramentKey: string) => {
    const date = participant.sacraments[`${sacramentKey}Date`];
    return participant.sacraments[sacramentKey] 
      ? (date || dictionary.participantCard.noDateSet)
      : 'No';
  };

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <InfoRow label={dictionary.participantCard.fullName} value={participant.fullName} />
      <InfoRow label={dictionary.participantCard.dob} value={age} />
      <InfoRow label={dictionary.participantCard.address} value={participant.address} />
      <InfoRow label={dictionary.participantCard.phone} value={participant.phone} />
      <InfoRow label={dictionary.participantCard.maritalStatus} value={localizedMaritalStatus} />
      <InfoRow label={dictionary.participantCard.parish} value={participant.parish} />
      <InfoRow label={dictionary.participantCard.previouslyMarried} value={participant.previouslyMarried} />
      <h3 className="font-semibold mt-4 mb-2 text-md">{dictionary.participantCard.sacramentalHistory}</h3>
      <InfoRow label={dictionary.participantCard.sacraments.baptism} value={getSacramentDate('baptism')} />
      <InfoRow label={dictionary.participantCard.sacraments.firstCommunion} value={getSacramentDate('firstCommunion')} />
      <InfoRow label={dictionary.participantCard.sacraments.confirmation} value={getSacramentDate('confirmation')} />
    </div>
  );
};


export default function PDFPreview({
  isOpen,
  onClose,
  formData,
  dictionary,
  lang,
  onConfirm,
  isSubmitting,
}: PDFPreviewProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const dateLocale = lang === 'es' ? es : enUS;

  const handleDownloadPDF = async () => {
    const content = pdfContentRef.current;
    if (!content) return;

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        backgroundColor: null, 
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const height = pdfWidth / ratio;
      
      let position = 0;
      let pageHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pageHeight;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pageHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`enrollment-summary-${formData.groom.fullName}-${formData.bride.fullName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!formData) return null;
  const { groom, bride, ...relationshipData } = formData;
  const { pdfPreview } = dictionary.form;
  const formDictionary = dictionary.form;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">{pdfPreview.title}</DialogTitle>
          <DialogDescription>{pdfPreview.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full">
            <div ref={pdfContentRef} className="p-8 bg-background text-foreground rounded-lg shadow-inner">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-headline text-primary-foreground/90">{dictionary.page.title}</h1>
                    <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
                </div>
                
                <ParticipantPDFSection participant={groom} dictionary={formDictionary} title={formDictionary.groom} locale={lang} />
                <Separator className="my-6" />
                <ParticipantPDFSection participant={bride} dictionary={formDictionary} title={formDictionary.bride} locale={lang} />
                
                <SectionTitle>{formDictionary.relationshipInfo.title}</SectionTitle>
                <InfoRow label={formDictionary.relationshipInfo.datingDuration} value={relationshipData.datingDuration} />
                <InfoRow label={formDictionary.relationshipInfo.liveTogether} value={relationshipData.liveTogether} />
                {relationshipData.liveTogether === 'Yes' && (
                    <InfoRow label={formDictionary.relationshipInfo.timeLivingTogether} value={relationshipData.timeLivingTogether} />
                )}
                <InfoRow label={formDictionary.relationshipInfo.weddingDateSet} value={relationshipData.weddingDate ? format(relationshipData.weddingDate, 'PPP', { locale: dateLocale }) : 'No'} />

                <SectionTitle>{formDictionary.childrenInfo.title}</SectionTitle>
                <InfoRow label={formDictionary.childrenInfo.inCommon} value={relationshipData.childrenInCommon?.toString()} />
                <InfoRow label={formDictionary.childrenInfo.groom} value={relationshipData.groomChildren?.toString()} />
                <InfoRow label={formDictionary.childrenInfo.bride} value={relationshipData.brideChildren?.toString()} />
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>{pdfPreview.cancelButton}</Button>
            <Button variant="outline" onClick={handleDownloadPDF} disabled={isSubmitting}>
              <Download className="mr-2 h-4 w-4" />
              {pdfPreview.downloadButton}
            </Button>
            <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? pdfPreview.submitting : pdfPreview.confirmButton}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
