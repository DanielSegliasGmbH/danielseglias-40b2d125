import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CATEGORIES, QUESTIONS, ANSWER_OPTIONS } from './constants';
import type { UserData, Category } from './types';

interface Props {
  userData: UserData;
  updateCategoryInterest: (categoryId: string, interested: boolean | undefined) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  interestedCategories: Category[];
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function FinanzcheckStep2({
  userData,
  updateCategoryInterest,
  updateAnswer,
  interestedCategories,
  isValid,
  onNext,
  onBack,
}: Props) {
  const questionsForCategory = (categoryId: string) =>
    QUESTIONS.filter((q) => q.categoryId === categoryId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schritt 2: Themen & Fragen</CardTitle>
        <CardDescription>
          Wählen Sie die Bereiche, die Sie interessieren, und beantworten Sie die Fragen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Welche Themen interessieren Sie?</Label>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={userData.categoryInterest[cat.id] === true}
                  onCheckedChange={(checked) =>
                    updateCategoryInterest(cat.id, checked === true ? true : undefined)
                  }
                />
                <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                  {cat.label}
                </Label>
              </div>
            ))}
          </div>
          {interestedCategories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Bitte wählen Sie mindestens einen Themenbereich aus.
            </p>
          )}
        </div>

        {/* Questions per selected category */}
        {interestedCategories.length > 0 && (
          <div className="space-y-6 border-t pt-6">
            {interestedCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h4 className="font-medium text-primary">{category.label}</h4>
                <div className="space-y-4">
                  {questionsForCategory(category.id).map((question) => (
                    <div key={question.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">{question.text}</p>
                      <RadioGroup
                        value={userData.answers[question.id] ?? ''}
                        onValueChange={(v) => updateAnswer(question.id, v)}
                        className="flex flex-wrap gap-3"
                      >
                        {ANSWER_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-1.5">
                            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                            <Label
                              htmlFor={`${question.id}-${option.value}`}
                              className="text-xs font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Auswertung anzeigen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
