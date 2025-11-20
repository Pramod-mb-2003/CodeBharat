
export type Goodie = {
  id: number;
  name: string;
  type: 'badge' | 'trophy' | 'sticker' | 'avatar' | 'real';
  description: string;
  icon: string;
};

export const ALL_GOODIES: Goodie[] = [
  { id: 50, name: 'Bronze Badge', type: 'badge', description: 'Earned at 50 points', icon: '🥉' },
  { id: 100, name: 'Silver Badge', type: 'badge', description: 'Earned at 100 points', icon: '🥈' },
  { id: 150, name: 'Gold Badge', type: 'badge', description: 'Earned at 150 points', icon: '🥇' },
  { id: 200, name: 'Achiever Trophy', type: 'trophy', description: 'Earned at 200 points', icon: '🏆' },
  { id: 250, name: 'Champion Trophy', type: 'trophy', description: 'Earned at 250 points', icon: '🏆' },
  { id: 300, name: 'Master Trophy', type: 'trophy', description: 'Earned at 300 points', icon: '🏆' },
  { id: 350, name: 'Star Sticker', type: 'sticker', description: 'Earned at 350 points', icon: '⭐' },
  { id: 400, name: 'Rocket Sticker', type: 'sticker', description: 'Earned at 400 points', icon: '🚀' },
  { id: 450, name: 'Brain Sticker', type: 'sticker', description: 'Earned at 450 points', icon: '🧠' },
  { id: 500, name: 'Robot Sticker', type: 'sticker', description: 'Earned at 500 points', icon: '🤖' },
  { id: 550, name: 'Cool Avatar', type: 'avatar', description: 'Unlock a cool avatar (550 pts)', icon: '🧑‍🎤' },
  { id: 600, name: 'Smart Avatar', type: 'avatar', description: 'Smart avatar (600 pts)', icon: '🧑‍🏫' },
  { id: 650, name: 'Ninja Avatar', type: 'avatar', description: 'Ninja avatar (650 pts)', icon: '🥷' },
  { id: 700, name: 'Wizard Avatar', type: 'avatar', description: 'Wizard avatar (700 pts)', icon: '🧙' },
  { id: 750, name: 'Pencil Pack', type: 'real', description: 'Real-world: Pencil (750 pts)', icon: '✏️' },
  { id: 800, name: 'Notebook', type: 'real', description: 'Real-world: Notebook (800 pts)', icon: '📓' },
  { id: 850, name: 'Drawing Kit', type: 'real', description: 'Real-world: Drawing kit (850 pts)', icon: '🎨' },
  { id: 900, name: 'Gift Box', type: 'real', description: 'Real-world: Gift Box (900 pts)', icon: '🎁' },
  { id: 1000, name: 'Mega Goodie Box', type: 'real', description: 'Mega Goodie Box (1000 pts)', icon: '🎉' }
];
