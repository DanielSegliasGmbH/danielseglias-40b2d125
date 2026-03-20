import { MessageSquare, User, Building2, UserCircle, Users, Handshake, FileCheck, PlayCircle } from 'lucide-react';

/**
 * Zentrale Konfiguration für den Bereich "Versicherungsberatung"
 * 
 * Hier können Unterkategorien hinzugefügt, entfernt oder umgeordnet werden.
 * Jeder Eintrag definiert:
 * - key: Eindeutiger Schlüssel (wird für Routing verwendet)
 * - path: URL-Pfad relativ zu /app/insurance-consulting
 * - titleKey: i18n-Schlüssel für den Titel
 * - icon: Lucide-Icon-Komponente
 */
export const insuranceConsultingSections = [
  {
    key: 'start',
    path: '/app/insurance-consulting/start',
    titleKey: 'insuranceConsulting.start',
    icon: PlayCircle,
  },
  {
    key: 'focus',
    path: '/app/insurance-consulting/focus',
    titleKey: 'insuranceConsulting.focus',
    icon: MessageSquare,
  },
  {
    key: 'introduction',
    path: '/app/insurance-consulting/introduction',
    titleKey: 'insuranceConsulting.introduction',
    icon: User,
  },
  {
    key: 'company',
    path: '/app/insurance-consulting/company',
    titleKey: 'insuranceConsulting.company',
    icon: Building2,
  },
  {
    key: 'advisor-info',
    path: '/app/insurance-consulting/advisor-info',
    titleKey: 'insuranceConsulting.advisorInfo',
    icon: UserCircle,
  },
  {
    key: 'customer-info',
    path: '/app/insurance-consulting/customer-info',
    titleKey: 'insuranceConsulting.customerInfo',
    icon: Users,
  },
  {
    key: 'consultation',
    path: '/app/insurance-consulting/consultation',
    titleKey: 'insuranceConsulting.consultation',
    icon: Handshake,
  },
  {
    key: 'summary',
    path: '/app/insurance-consulting/summary',
    titleKey: 'insuranceConsulting.summary',
    icon: FileCheck,
  },
] as const;

export type InsuranceConsultingSectionKey = typeof insuranceConsultingSections[number]['key'];
