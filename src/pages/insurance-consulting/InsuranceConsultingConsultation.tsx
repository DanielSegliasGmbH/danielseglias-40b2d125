import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { 
  TrendingUp, 
  Home, 
  PiggyBank, 
  Car, 
  Bike, 
  Heart,
  Users,
  Calendar,
  Briefcase,
  Shield,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PyramidTier {
  title: string;
  tooltip: string;
  items: {
    icon: React.ReactNode;
    label?: string;
  }[];
  bgGradient: string;
}

const pyramidTiers: PyramidTier[] = [
  {
    title: "Geniessen Sie Ihre finanzielle Freiheit",
    tooltip: "Vermögensaufbau und Investitionen für Ihre finanzielle Unabhängigkeit",
    items: [
      { icon: <TrendingUp className="w-12 h-12" /> }
    ],
    bgGradient: "from-blue-50 to-blue-100"
  },
  {
    title: "Gestalten Sie Ihre Zukunft",
    tooltip: "Altersvorsorge und Sparziele für Ihre Träume",
    items: [
      { icon: <Home className="w-10 h-10" /> },
      { icon: <PiggyBank className="w-10 h-10" />, label: "CHF" }
    ],
    bgGradient: "from-blue-100 to-blue-200"
  },
  {
    title: "Schützen Sie Dinge, die Sie lieben",
    tooltip: "Sachversicherungen für Ihr Hab und Gut",
    items: [
      { icon: <Home className="w-8 h-8" /> },
      { icon: <Car className="w-8 h-8" /> },
      { icon: <Bike className="w-8 h-8" /> },
      { icon: <Heart className="w-8 h-8" /> }
    ],
    bgGradient: "from-blue-200 to-blue-300"
  },
  {
    title: "Schützen Sie sich und Ihre Liebsten",
    tooltip: "Personenversicherungen für Sie und Ihre Familie",
    items: [
      { icon: <Users className="w-8 h-8" /> },
      { icon: <Calendar className="w-8 h-8" /> },
      { icon: <Briefcase className="w-8 h-8" /> },
      { icon: <Shield className="w-8 h-8" /> }
    ],
    bgGradient: "from-blue-300 to-blue-400"
  }
];

export default function InsuranceConsultingConsultation() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container py-12 space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Was ist Ihnen wichtig?
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Gemeinsam analysieren wir Ihre Bedürfnisse und finden die passenden Lösungen für Sie.
            </p>
          </div>

          {/* Pyramid Container */}
          <TooltipProvider>
            <div className="relative max-w-4xl mx-auto">
              {/* Background pyramid shape */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%)',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
                }}
              />

              {/* Pyramid Tiers */}
              <div className="relative space-y-6">
                {pyramidTiers.map((tier, tierIndex) => (
                  <div 
                    key={tierIndex}
                    className="flex flex-col items-center"
                    style={{
                      paddingLeft: `${(pyramidTiers.length - tierIndex - 1) * 8}%`,
                      paddingRight: `${(pyramidTiers.length - tierIndex - 1) * 8}%`
                    }}
                  >
                    {/* Tier Title with Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold text-slate-700 text-center">
                        {tier.title}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-blue-500 hover:text-blue-600 transition-colors">
                            <Info className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{tier.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Tier Items */}
                    <div className={`
                      w-full rounded-2xl p-6 
                      bg-gradient-to-r ${tier.bgGradient}
                      shadow-sm border border-blue-200/50
                      flex justify-center gap-4 flex-wrap
                    `}>
                      {tier.items.map((item, itemIndex) => (
                        <div 
                          key={itemIndex}
                          className="
                            bg-white/80 backdrop-blur-sm rounded-xl p-4
                            shadow-sm border border-blue-100
                            flex flex-col items-center justify-center
                            min-w-[80px] min-h-[80px]
                            hover:shadow-md hover:scale-105 transition-all
                            cursor-pointer
                          "
                        >
                          <div className="text-blue-600">
                            {item.icon}
                          </div>
                          {item.label && (
                            <span className="text-xs font-medium text-blue-700 mt-1">
                              {item.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipProvider>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <p className="text-muted-foreground">
              Klicken Sie auf einen Bereich, um mehr zu erfahren.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
