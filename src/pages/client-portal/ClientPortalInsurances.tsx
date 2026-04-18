import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Shield, Plus, Pencil, Trash2, ExternalLink, ArrowLeft, Loader2,
  Building2, PiggyBank, TrendingUp, CreditCard, Heart, Car, Home, Briefcase,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PrivateValue } from '@/components/client-portal/PrivateValue';

// ─── Types ─────────────────────────────────────────────────────

interface Product {
  id: string;
  customer_id: string;
  user_id: string;
  product_name: string;
  category: string;
  provider: string | null;
  price: number | null;
  payment_interval: string;
  notes: string | null;
  document_url: string | null;
  portal_url: string | null;
  created_at: string;
  updated_at: string;
}

type ProductFormData = {
  product_name: string;
  category: string;
  provider: string;
  price: string;
  payment_interval: string;
  notes: string;
  document_url: string;
  portal_url: string;
};

const EMPTY_FORM: ProductFormData = {
  product_name: '',
  category: 'versicherung',
  provider: '',
  price: '',
  payment_interval: 'monatlich',
  notes: '',
  document_url: '',
  portal_url: '',
};

// ─── Constants ─────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'versicherung', label: 'Versicherung' },
  { value: 'vorsorge', label: 'Vorsorge' },
  { value: 'anlage', label: 'Anlage' },
  { value: 'bank', label: 'Bankkonto' },
  { value: 'kredit', label: 'Kredit / Hypothek' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const PROVIDERS = [
  'AXA', 'Allianz Suisse', 'Baloise', 'CSS', 'Generali', 'Helvetia',
  'Mobiliar', 'Swiss Life', 'Swica', 'Vaudoise', 'Zurich',
  'PostFinance', 'UBS', 'Credit Suisse', 'Raiffeisen', 'ZKB',
  'VIAC', 'Finpension', 'Frankly', 'True Wealth', 'Selma Finance',
  'Andere',
];

const INTERVALS = [
  { value: 'monatlich', label: 'Monatlich' },
  { value: 'quartalsweise', label: 'Quartalsweise' },
  { value: 'halbjährlich', label: 'Halbjährlich' },
  { value: 'jährlich', label: 'Jährlich' },
  { value: 'einmalig', label: 'Einmalig' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  versicherung: Shield,
  vorsorge: PiggyBank,
  anlage: TrendingUp,
  bank: CreditCard,
  kredit: Home,
  sonstiges: Briefcase,
};

const CATEGORY_COLORS: Record<string, string> = {
  versicherung: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  vorsorge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  anlage: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  bank: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  kredit: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  sonstiges: 'bg-muted text-muted-foreground',
};

function formatPrice(price: number | null, interval: string) {
  if (price == null) return '–';
  const formatted = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(price);
  const intervalLabel = INTERVALS.find(i => i.value === interval)?.label?.toLowerCase() || interval;
  return `${formatted} / ${intervalLabel}`;
}

function getCategoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label || value;
}

// ─── Component ─────────────────────────────────────────────────

export default function ClientPortalInsurances() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // ─── Fetch customer_id ──────────────────────────────────────
  const { data: customerId } = useQuery({
    queryKey: ['my-customer-id'],
    queryFn: async () => {
      const { data } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data?.customer_id ?? null;
    },
    enabled: !!user,
  });

  // ─── Fetch products ──────────────────────────────────────────
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['customer-products', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Product[];
    },
    enabled: !!customerId,
  });

  // ─── Mutations ───────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        product_name: data.product_name.trim(),
        category: data.category,
        provider: data.provider || null,
        price: data.price ? parseFloat(data.price) : null,
        payment_interval: data.payment_interval,
        notes: data.notes || null,
        document_url: data.document_url || null,
        portal_url: data.portal_url || null,
        customer_id: customerId!,
        user_id: user!.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('customer_products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_products')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-products'] });
      toast.success(editingProduct ? 'Produkt aktualisiert' : 'Produkt hinzugefügt');
      closeDialog();
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-products'] });
      toast.success('Produkt gelöscht');
      setDeleteConfirm(null);
      setSelectedProduct(null);
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  // ─── Handlers ────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      product_name: p.product_name,
      category: p.category,
      provider: p.provider || '',
      price: p.price != null ? String(p.price) : '',
      payment_interval: p.payment_interval,
      notes: p.notes || '',
      document_url: p.document_url || '',
      portal_url: p.portal_url || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim()) {
      toast.error('Bitte Produktname eingeben');
      return;
    }
    saveMutation.mutate(form);
  };

  const updateField = (field: keyof ProductFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ─── Detail view ─────────────────────────────────────────────
  if (selectedProduct) {
    const p = selectedProduct;
    const Icon = CATEGORY_ICONS[p.category] || Briefcase;
    return (
      <ClientPortalLayout>
        <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
          <PageHeader title="📦 Meine Produkte" subtitle="Übersicht deiner Versicherungen, Vorsorge und Finanzprodukte" />
          <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>


          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">{p.product_name}</h1>
                  <Badge variant="secondary" className={CATEGORY_COLORS[p.category]}>
                    {getCategoryLabel(p.category)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Anbieter</p>
                  <p className="text-sm font-medium text-foreground">{p.provider || '–'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Kosten</p>
                  <p className="text-sm font-medium text-foreground">{formatPrice(p.price, p.payment_interval)}</p>
                </div>
              </div>

              {p.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notizen</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{p.notes}</p>
                </div>
              )}

              {p.document_url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Link zur Police</p>
                  <a
                    href={p.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    onClick={(e) => { e.preventDefault(); window.open(p.document_url!, '_blank', 'noopener,noreferrer'); }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Police öffnen
                  </a>
                </div>
              )}

              {p.portal_url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Kundenportal</p>
                  <a
                    href={p.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    onClick={(e) => { e.preventDefault(); window.open(p.portal_url!, '_blank', 'noopener,noreferrer'); }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Portal öffnen
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(null); openEdit(p); }} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(p)} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete confirm */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Produkt löschen?</DialogTitle>
              <DialogDescription>
                „{deleteConfirm?.product_name}" wird unwiderruflich gelöscht.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Abbrechen</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Löschen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ClientPortalLayout>
    );
  }

  // ─── Grid view ───────────────────────────────────────────────
  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <PageHeader title="📦 Meine Produkte" subtitle="Übersicht deiner Versicherungen, Vorsorge und Finanzprodukte" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="category-filter" className="text-xs text-muted-foreground shrink-0">Filter:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Produkte</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {customerId && (
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Produkt hinzufügen
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 h-36" />
              </Card>
            ))}
          </div>
        ) : (() => {
          const filteredProducts = categoryFilter === 'all'
            ? products
            : products.filter(p => p.category === categoryFilter);

          if (filteredProducts.length === 0) {
            return (
              <div className="space-y-4">
                <EmptyState
                  icon={Shield}
                  title={categoryFilter === 'all' ? 'Noch keine Produkte' : 'Keine Produkte in dieser Kategorie'}
                  description={categoryFilter === 'all'
                    ? 'Füge dein erstes Finanzprodukt hinzu – z. B. eine Versicherung, Vorsorge oder Anlage.'
                    : 'In dieser Kategorie hast du noch keine Produkte erfasst.'}
                />
                {customerId && (
                  <div className="flex justify-center">
                    <Button onClick={openAdd} className="gap-2">
                      <Plus className="h-4 w-4" /> Produkt hinzufügen
                    </Button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map(p => {
                const Icon = CATEGORY_ICONS[p.category] || Briefcase;
                return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
                  onClick={() => setSelectedProduct(p)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLORS[p.category]}`}>
                        {getCategoryLabel(p.category)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{p.product_name}</h3>
                      {p.provider && (
                        <p className="text-xs text-muted-foreground mt-0.5">{p.provider}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.price != null && (
                        <PrivateValue className="text-sm font-medium text-foreground flex-1">
                          {formatPrice(p.price, p.payment_interval)}
                        </PrivateValue>
                      )}
                      {(p.document_url || p.portal_url) && (
                        <div className="flex gap-1">
                          {p.document_url && (
                            <button
                              className="p-1 rounded hover:bg-primary/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); window.open(p.document_url!, '_blank', 'noopener,noreferrer'); }}
                              title="Police öffnen"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-primary" />
                            </button>
                          )}
                          {p.portal_url && (
                            <button
                              className="p-1 rounded hover:bg-primary/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); window.open(p.portal_url!, '_blank', 'noopener,noreferrer'); }}
                              title="Kundenportal öffnen"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-primary" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Aktualisiere die Angaben zu deinem Produkt.' : 'Erfasse ein neues Finanzprodukt.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="product_name">Produktname *</Label>
              <Input
                id="product_name"
                value={form.product_name}
                onChange={e => updateField('product_name', e.target.value)}
                placeholder="z. B. Haushaltsversicherung"
                maxLength={100}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategorie</Label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Anbieter</Label>
                <Select value={form.provider} onValueChange={v => updateField('provider', v)}>
                  <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Preis (CHF)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => updateField('price', e.target.value)}
                  placeholder="z. B. 45.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Zahlungsintervall</Label>
                <Select value={form.payment_interval} onValueChange={v => updateField('payment_interval', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={e => updateField('notes', e.target.value)}
                placeholder="z. B. Policennummer, Besonderheiten..."
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="document_url">Link zur Police (optional)</Label>
              <Input
                id="document_url"
                type="url"
                value={form.document_url}
                onChange={e => updateField('document_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="portal_url">Link zum Kundenportal (optional)</Label>
              <Input
                id="portal_url"
                type="url"
                value={form.portal_url}
                onChange={e => updateField('portal_url', e.target.value)}
                placeholder="z.B. https://login.axa.ch"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Abbrechen</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProduct ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ClientPortalLayout>
  );
}
