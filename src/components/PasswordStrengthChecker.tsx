/**
 * Password Strength Checker Component
 * 
 * IMPORTANT: For full security, also enable in Supabase Dashboard:
 * Auth → Password Security → Leaked Password Protection
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRule {
  key: string;
  label: string;
  test: (password: string, context?: PasswordContext) => boolean;
}

interface PasswordContext {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface PasswordStrengthCheckerProps {
  password: string;
  context?: PasswordContext;
  className?: string;
}

export function usePasswordValidation(password: string, context?: PasswordContext) {
  const { t } = useTranslation();

  const rules: PasswordRule[] = useMemo(() => [
    {
      key: 'minLength',
      label: t('auth.password.rules.minLength'),
      test: (pwd) => pwd.length >= 12,
    },
    {
      key: 'uppercase',
      label: t('auth.password.rules.uppercase'),
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      key: 'lowercase',
      label: t('auth.password.rules.lowercase'),
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      key: 'number',
      label: t('auth.password.rules.number'),
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      key: 'special',
      label: t('auth.password.rules.special'),
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd),
    },
    {
      key: 'noEmail',
      label: t('auth.password.rules.noEmail'),
      test: (pwd, ctx) => {
        if (!ctx?.email) return true;
        const emailParts = ctx.email.toLowerCase().split('@')[0];
        if (emailParts.length < 3) return true;
        return !pwd.toLowerCase().includes(emailParts);
      },
    },
    {
      key: 'noName',
      label: t('auth.password.rules.noName'),
      test: (pwd, ctx) => {
        const pwdLower = pwd.toLowerCase();
        if (ctx?.firstName && ctx.firstName.length >= 3 && pwdLower.includes(ctx.firstName.toLowerCase())) {
          return false;
        }
        if (ctx?.lastName && ctx.lastName.length >= 3 && pwdLower.includes(ctx.lastName.toLowerCase())) {
          return false;
        }
        return true;
      },
    },
  ], [t]);

  const results = useMemo(() => {
    return rules.map((rule) => ({
      ...rule,
      passed: rule.test(password, context),
    }));
  }, [rules, password, context]);

  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;

  const strength = useMemo(() => {
    if (passedCount <= 2) return 'weak';
    if (passedCount <= 5) return 'medium';
    return 'strong';
  }, [passedCount]);

  return { rules: results, allPassed, passedCount, strength, totalRules: rules.length };
}

export function PasswordStrengthChecker({ password, context, className }: PasswordStrengthCheckerProps) {
  const { t } = useTranslation();
  const { rules, strength, passedCount, totalRules } = usePasswordValidation(password, context);

  const strengthConfig = {
    weak: { label: t('auth.password.strength.weak'), color: 'bg-destructive', width: '33%' },
    medium: { label: t('auth.password.strength.medium'), color: 'bg-yellow-500', width: '66%' },
    strong: { label: t('auth.password.strength.strong'), color: 'bg-green-500', width: '100%' },
  };

  const currentStrength = strengthConfig[strength];

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Indicator */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t('auth.password.strength.label')}</span>
          <span className={cn(
            'font-medium',
            strength === 'weak' && 'text-destructive',
            strength === 'medium' && 'text-yellow-600 dark:text-yellow-500',
            strength === 'strong' && 'text-green-600 dark:text-green-500',
          )}>
            {currentStrength.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-300', currentStrength.color)}
            style={{ width: currentStrength.width }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <ul className="space-y-1 text-sm">
        {rules.map((rule) => (
          <li 
            key={rule.key} 
            className={cn(
              'flex items-center gap-2',
              rule.passed ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
            )}
          >
            {rule.passed ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <X className="h-4 w-4 shrink-0" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>

      {/* Progress */}
      <p className="text-xs text-muted-foreground">
        {passedCount}/{totalRules} {t('auth.password.rulesFulfilled')}
      </p>
    </div>
  );
}
