import { colors } from '../styles/theme';

export const ritualsData = {
  breathe: [
    {
      id: 'b1',
      title: 'MORNING CLARITY',
      duration: '5 min',
      author: 'Dr. Andrew Huberman',
      description: 'Box breathing para empezar el día con foco',
      icon: 'sunny-outline',
      iconColor: colors.naranjaCTA
    },
    {
      id: 'b2',
      title: 'STRESS RELEASE',
      duration: '7 min',
      author: 'Wim Hof',
      description: 'Respiración energizante para liberar tensión',
      icon: 'water-outline',
      iconColor: colors.verdeBosque
    },
    {
      id: 'b3',
      title: 'EVENING CALM',
      duration: '10 min',
      author: 'Sara Raymond',
      description: 'Respiración 4-7-8 para relajación profunda',
      icon: 'moon-outline',
      iconColor: colors.marronTierra
    }
  ],
  train: [
    {
      id: 't1',
      title: 'SNORECORE',
      duration: '20 min',
      author: 'Chloe Ting',
      description: 'Core workout intenso sin equipamiento',
      icon: 'flame-outline',
      iconColor: colors.naranjaCTA
    },
    {
      id: 't2',
      title: 'MORNING FLOW',
      duration: '15 min',
      author: 'Adriene Mishler',
      description: 'Yoga flow para activar el cuerpo',
      icon: 'body-outline',
      iconColor: colors.verdeBosque
    },
    {
      id: 't3',
      title: 'EVENING RESTORE',
      duration: '25 min',
      author: 'Jeff Cavaliere',
      description: 'Movilidad y estiramientos restaurativos',
      icon: 'sparkles-outline',
      iconColor: colors.marronTierra
    }
  ],
  eat: [
    {
      id: 'e1',
      title: 'POST WORKOUT BOWL',
      duration: '15 min prep',
      author: 'Dr. Rhonda Patrick',
      description: 'Bowl proteico con verduras y granos',
      icon: 'restaurant-outline',
      iconColor: colors.verdeBosque
    },
    {
      id: 'e2',
      title: 'MORNING FUEL',
      duration: '10 min prep',
      author: 'Tim Ferriss',
      description: 'Desayuno alto en proteína y grasas saludables',
      icon: 'egg-outline',
      iconColor: colors.naranjaCTA
    },
    {
      id: 'e3',
      title: 'RECOVERY SMOOTHIE',
      duration: '5 min prep',
      author: 'Dr. Peter Attia',
      description: 'Batido con proteína, frutas y adaptógenos',
      icon: 'cafe-outline',
      iconColor: colors.marronTierra
    }
  ]
};

export const getDailyRitual = (type) => {
  const rituals = ritualsData[type];
  // Por ahora retorna un ritual random, después podemos hacerlo más inteligente
  const today = new Date().getDay();
  return rituals[today % rituals.length];
};