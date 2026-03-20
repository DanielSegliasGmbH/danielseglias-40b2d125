import { MessageSquare, User, Building2, UserCircle, Users, Handshake, FileCheck, PlayCircle, ClipboardList, Lightbulb, Gift } from 'lucide-react';

/**
 * Zentrale Konfiguration für den Bereich "Anlageberatung"
 * 
 * Geklont von insuranceConsultingConfig.ts – identische Struktur.
 */
export const investmentConsultingSections = [
  {
    key: 'start',
    path: '/app/investment-consulting/start',
    titleKey: 'investmentConsulting.start',
    icon: PlayCircle,
  },
  {
    key: 'focus',
    path: '/app/investment-consulting/focus',
    titleKey: 'investmentConsulting.focus',
    icon: MessageSquare,
  },
  {
    key: 'introduction',
    path: '/app/investment-consulting/introduction',
    titleKey: 'investmentConsulting.introduction',
    icon: User,
  },
  {
    key: 'company',
    path: '/app/investment-consulting/company',
    titleKey: 'investmentConsulting.company',
    icon: Building2,
  },
  {
    key: 'advisor-info',
    path: '/app/investment-consulting/advisor-info',
    titleKey: 'investmentConsulting.advisorInfo',
    icon: UserCircle,
  },
  {
    key: 'customer-info',
    path: '/app/investment-consulting/customer-info',
    titleKey: 'investmentConsulting.customerInfo',
    icon: Users,
  },
  {
    key: 'consultation',
    path: '/app/investment-consulting/consultation',
    titleKey: 'investmentConsulting.consultation',
    icon: Handshake,
  },
  {
    key: 'needs',
    path: '/app/investment-consulting/needs',
    titleKey: 'investmentConsulting.needs',
    icon: ClipboardList,
  },
  {
    key: 'answers',
    path: '/app/investment-consulting/answers',
    titleKey: 'investmentConsulting.answers',
    icon: Lightbulb,
  },
  {
    key: 'summary',
    path: '/app/investment-consulting/summary',
    titleKey: 'investmentConsulting.summary',
    icon: FileCheck,
  },
  {
    key: 'offer',
    path: '/app/investment-consulting/offer',
    titleKey: 'investmentConsulting.offer',
    icon: Gift,
  },
] as const;

export type InvestmentConsultingSectionKey = typeof investmentConsultingSections[number]['key'];
