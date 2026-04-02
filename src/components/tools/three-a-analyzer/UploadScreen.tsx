import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UploadedFile } from './types';
import { toast } from 'sonner';

interface UploadScreenProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
  onAnalyze: () => void;
  onBack: () => void;
  analysisId: string | null;
}

const ACCEPTED_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 10;

const DOC_TYPE_LABELS = [
  'Police',
  'Vertrag',
  'Produktblatt',
  'Jahresauszug',
  'Gebührenübersicht',
  'Fondsinformationen',
  'Sonstiges PDF',
];

export function UploadScreen({ files, onFilesChange, onAnalyze, onBack, analysisId }: UploadScreenProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    const uploadedFile: UploadedFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };

    onFilesChange([...files, uploadedFile]);

    try {
      const storagePath = `${analysisId || 'temp'}/${id}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('three-a-documents')
        .upload(storagePath, file, { upsert: false });

      if (error) throw error;

      // Save document reference
      if (analysisId) {
        await supabase.from('three_a_documents').insert({
          analysis_id: analysisId,
          file_name: file.name,
          file_path: storagePath,
          file_size: file.size,
          document_type: 'unknown',
          processing_status: 'uploaded',
        });
      }

      onFilesChange(prev => prev.map(f => 
        f.id === id ? { ...f, progress: 100, status: 'uploaded' as const, storagePath } : f
      ));
    } catch (err) {
      console.error('Upload error:', err);
      onFilesChange(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'error' as const } : f
      ));
      toast.error(`Fehler beim Hochladen von ${file.name}`);
    }
  }, [files, onFilesChange, analysisId]);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    for (const file of fileArray) {
      if (files.length >= MAX_FILES) {
        toast.error(`Maximal ${MAX_FILES} Dateien erlaubt.`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Nur PDF-Dateien werden unterstützt.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Datei zu gross (max. 20 MB).`);
        continue;
      }
      uploadFile(file);
    }
  }, [files, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const uploadedCount = files.filter(f => f.status === 'uploaded').length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Dokumente hochladen</h2>
        <p className="text-muted-foreground">
          Lade deine 3a-Unterlagen hoch – z. B. Police, Jahresauszug, Produktblatt oder Gebührenübersicht.
        </p>
      </div>

      {/* Supported document types */}
      <div className="flex flex-wrap gap-2">
        {DOC_TYPE_LABELS.map(label => (
          <span key={label} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {label}
          </span>
        ))}
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium text-foreground mb-1">
            PDF-Dateien hierher ziehen oder klicken
          </p>
          <p className="text-sm text-muted-foreground">
            Max. {MAX_FILES} Dateien · Max. 20 MB pro Datei · Nur PDF
          </p>
        </CardContent>
      </Card>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {uploadedCount} von {files.length} Datei(en) hochgeladen
          </p>
          {files.map(f => (
            <Card key={f.id} className="overflow-hidden">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                    {f.status === 'uploading' && (
                      <Progress value={f.progress} className="mt-1 h-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status === 'uploaded' && (
                      <span className="text-xs text-primary font-medium">✓</span>
                    )}
                    {f.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(f.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <Button
          onClick={onAnalyze}
          disabled={uploadedCount === 0}
          className="gap-2"
        >
          Analyse starten
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-muted-foreground text-center">
        Deine Dokumente werden verschlüsselt übertragen und ausschliesslich für die Analyse verwendet.
      </p>
    </div>
  );
}
