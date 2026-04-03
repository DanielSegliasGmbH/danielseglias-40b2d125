import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '@/components/OnboardingScreen';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/login', { replace: true });
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}
