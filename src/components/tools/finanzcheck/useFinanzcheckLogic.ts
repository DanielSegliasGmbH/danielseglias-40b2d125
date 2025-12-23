import { useState, useMemo } from 'react';
import { CATEGORIES, QUESTIONS, ANSWER_OPTIONS } from './constants';
import type { UserData, CategoryScore, Recommendation, FinanzcheckResult } from './types';

const initialUserData: UserData = {
  age: null,
  income: null,
  expenses: null,
  thirdPillar: null,
  thirdPillarType: null,
  categoryInterest: {},
  answers: {},
};

export function useFinanzcheckLogic() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const updateUserData = <K extends keyof UserData>(key: K, value: UserData[K]) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setUserData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  };

  const updateCategoryInterest = (categoryId: string, interested: boolean | undefined) => {
    setUserData((prev) => ({
      ...prev,
      categoryInterest: { ...prev.categoryInterest, [categoryId]: interested },
    }));
  };

  // Validation
  const isStep1Valid = useMemo(() => {
    const { age, income, expenses, thirdPillar } = userData;
    if (age === null || income === null || expenses === null || thirdPillar === null) return false;
    if (age < 18 || age > 80) return false;
    if (income < 0 || expenses < 0) return false;
    return true;
  }, [userData]);

  const interestedCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => userData.categoryInterest[cat.id] === true);
  }, [userData.categoryInterest]);

  const questionsForInterestedCategories = useMemo(() => {
    const interestedIds = interestedCategories.map((c) => c.id);
    return QUESTIONS.filter((q) => interestedIds.includes(q.categoryId));
  }, [interestedCategories]);

  const isStep2Valid = useMemo(() => {
    if (interestedCategories.length === 0) return false;

    const totalQuestions = questionsForInterestedCategories.length;
    const answeredQuestions = questionsForInterestedCategories.filter(
      (q) => userData.answers[q.id] !== undefined
    ).length;

    return answeredQuestions >= Math.ceil(totalQuestions * 0.5);
  }, [interestedCategories, questionsForInterestedCategories, userData.answers]);

  // Calculate results
  const result = useMemo<FinanzcheckResult | null>(() => {
    if (currentStep < 3) return null;

    const categoryScores: CategoryScore[] = [];

    for (const category of interestedCategories) {
      const categoryQuestions = QUESTIONS.filter((q) => q.categoryId === category.id);
      let points = 0;
      let maxPoints = 0;

      for (const question of categoryQuestions) {
        const answer = userData.answers[question.id];
        if (!answer || answer === 'na') continue;

        const answerOption = ANSWER_OPTIONS.find((o) => o.value === answer);
        if (answerOption && answerOption.points !== null) {
          points += answerOption.points;
          maxPoints += 2; // max per question is 2
        }
      }

      if (maxPoints > 0) {
        categoryScores.push({
          categoryId: category.id,
          label: category.label,
          score: points,
          maxScore: maxPoints,
          percentage: Math.round((points / maxPoints) * 100),
        });
      }
    }

    const overallScore =
      categoryScores.length > 0
        ? Math.round(
            categoryScores.reduce((sum, cs) => sum + cs.percentage, 0) / categoryScores.length
          )
        : 0;

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    for (const category of interestedCategories) {
      const categoryQuestions = QUESTIONS.filter((q) => q.categoryId === category.id);

      // First priority: questions answered with 'no'
      const noQuestion = categoryQuestions.find((q) => userData.answers[q.id] === 'no');
      if (noQuestion) {
        recommendations.push({
          categoryId: category.id,
          categoryLabel: category.label,
          text: noQuestion.recommendation,
          priority: 'high',
        });
        continue;
      }

      // Second priority: questions answered with 'unsure'
      const unsureQuestion = categoryQuestions.find((q) => userData.answers[q.id] === 'unsure');
      if (unsureQuestion) {
        recommendations.push({
          categoryId: category.id,
          categoryLabel: category.label,
          text: unsureQuestion.recommendation,
          priority: 'medium',
        });
      }
    }

    // Sort by priority and limit to 6
    recommendations.sort((a, b) => (a.priority === 'high' ? -1 : 1));

    // Ensure at least 3 recommendations if possible
    let finalRecs = recommendations.slice(0, 6);
    if (finalRecs.length < 3 && recommendations.length >= 3) {
      finalRecs = recommendations.slice(0, 3);
    }

    return { overallScore, categoryScores, recommendations: finalRecs };
  }, [currentStep, interestedCategories, userData.answers]);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const reset = () => {
    setCurrentStep(0);
    setUserData(initialUserData);
  };

  return {
    currentStep,
    userData,
    updateUserData,
    updateAnswer,
    updateCategoryInterest,
    isStep1Valid,
    isStep2Valid,
    interestedCategories,
    questionsForInterestedCategories,
    result,
    goNext,
    goBack,
    reset,
  };
}
