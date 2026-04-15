import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '@/components/OnboardingScreen';

export default function Onboarding() {
  const navigate = useNavigate();
  const [showFinanzTyp, setShowFinanzTyp] = useState(false);

  const handleComplete = () => {
    localStorage.setItem('client_onboarding_complete', 'true');
    navigate('/app/client-portal', { replace: true });
  };

  const handleStartFinanzTyp = () => {
    localStorage.setItem('client_onboarding_complete', 'true');
    navigate('/app/client-portal/finanz-typ', { replace: true });
  };

  return (
    <OnboardingScreen
      onComplete={handleComplete}
      onStartFinanzTyp={handleStartFinanzTyp}
    />
  );
}
