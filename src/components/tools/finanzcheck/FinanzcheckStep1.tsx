import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { THIRD_PILLAR_TYPES } from './constants';
import type { UserData } from './types';

interface Props {
  userData: UserData;
  updateUserData: <K extends keyof UserData>(key: K, value: UserData[K]) => void;
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function FinanzcheckStep1({ userData, updateUserData, isValid, onNext, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schritt 1: Basisdaten</CardTitle>
        <CardDescription>
          Einige grundlegende Angaben, um die Auswertung auf Ihre Situation anzupassen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="age">Alter *</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={80}
              placeholder="z.B. 35"
              value={userData.age ?? ''}
              onChange={(e) => updateUserData('age', e.target.value ? Number(e.target.value) : null)}
            />
            {userData.age !== null && (userData.age < 18 || userData.age > 80) && (
              <p className="text-xs text-destructive">Bitte geben Sie ein Alter zwischen 18 und 80 ein.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="income">Nettoeinkommen (CHF/Mt.) *</Label>
            <Input
              id="income"
              type="number"
              min={0}
              placeholder="z.B. 6000"
              value={userData.income ?? ''}
              onChange={(e) => updateUserData('income', e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenses">Ausgaben (CHF/Mt.) *</Label>
            <Input
              id="expenses"
              type="number"
              min={0}
              placeholder="z.B. 4500"
              value={userData.expenses ?? ''}
              onChange={(e) => updateUserData('expenses', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Zahlen Sie in die Säule 3a ein? *</Label>
          <RadioGroup
            value={userData.thirdPillar ?? ''}
            onValueChange={(v) => updateUserData('thirdPillar', v as 'yes' | 'no' | 'unsure')}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="3a-yes" />
              <Label htmlFor="3a-yes" className="font-normal cursor-pointer">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="3a-no" />
              <Label htmlFor="3a-no" className="font-normal cursor-pointer">Nein</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unsure" id="3a-unsure" />
              <Label htmlFor="3a-unsure" className="font-normal cursor-pointer">Nicht sicher</Label>
            </div>
          </RadioGroup>
        </div>

        {userData.thirdPillar === 'yes' && (
          <div className="space-y-2">
            <Label>Bei welchem Anbietertyp? (optional)</Label>
            <Select
              value={userData.thirdPillarType ?? ''}
              onValueChange={(v) => updateUserData('thirdPillarType', v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Anbietertyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                {THIRD_PILLAR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
