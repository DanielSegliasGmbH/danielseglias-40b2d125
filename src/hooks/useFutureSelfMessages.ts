import { useUserAvatar } from './useUserAvatar';

/**
 * Returns helper functions to generate motivational messages
 * referencing the user's future self name.
 */
export function useFutureSelfMessages() {
  const { futureSelfName, completed } = useUserAvatar();

  const name = futureSelfName || 'Dein Zukunfts-Ich';

  const taskCompleted = () =>
    completed ? `${name} hätte das auch so gemacht.` : 'Gut gemacht!';

  const streakMilestone = () =>
    completed ? `${name} ist beeindruckt.` : 'Weiter so!';

  const rankUp = () =>
    completed ? `Du kommst ${name} näher.` : 'Du steigst auf!';

  const welcome = () =>
    completed ? `${name} freut sich, dich zu sehen.` : 'Willkommen zurück!';

  const setback = () =>
    completed ? `${name} wartet. Gib nicht auf.` : 'Bleib dran!';

  const achievement = () =>
    completed ? `Ein Schritt näher zu ${name}.` : 'Stark!';

  return {
    name,
    hasAvatar: completed,
    taskCompleted,
    streakMilestone,
    rankUp,
    welcome,
    setback,
    achievement,
  };
}
