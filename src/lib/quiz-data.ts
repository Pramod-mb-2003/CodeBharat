export type QuizQuestion = {
  id: string;
  question: string;
  options: { text: string; category: string }[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: "When you have free time, you'd rather...",
    options: [
      { text: 'Play or watch a sport', category: 'sports' },
      { text: 'Do a puzzle or brain-teaser', category: 'math' },
      { text: 'Read a book or write a story', category: 'english' },
      { text: 'Draw, paint, or create something new', category: 'creativity' },
    ],
  },
  {
    id: 'q2',
    question: 'Which school subject do you enjoy the most?',
    options: [
      { text: 'Physical Education', category: 'sports' },
      { text: 'Science class (Biology, Chemistry)', category: 'science' },
      { text: 'History or Geography', category: 'social' },
      { text: 'Art or Music', category: 'creativity' },
    ],
  },
  {
    id: 'q3',
    question: 'You are at a museum. Which exhibit do you visit first?',
    options: [
      { text: 'The history of ancient civilizations', category: 'social' },
      { text: 'The interactive physics and space exhibit', category: 'science' },
      { text: 'The modern art gallery', category: 'creativity' },
      { text: 'The evolution of language exhibit', category: 'english' },
    ],
  },
  {
    id: 'q4',
    question: 'If you were to watch a documentary, it would be about...',
    options: [
      { text: 'A famous athlete or sports team', category: 'sports' },
      { text: 'The wonders of the natural world', category: 'science' },
      { text: 'How numbers shape our world', category: 'math' },
      { text: 'The life of a famous writer or poet', category: 'english' },
    ],
  },
  {
    id: 'q5',
    question: 'Which of these activities sounds most appealing?',
    options: [
      { text: 'Joining a debate club', category: 'english' },
      { text: 'Building a robot for a competition', category: 'science' },
      { text: 'Organizing a community event', category: 'social' },
      { text: 'Solving complex logic puzzles', category: 'math' },
    ],
  },
  {
    id: 'q6',
    question: 'What kind of games do you prefer?',
    options: [
      { text: 'Team-based sports games', category: 'sports' },
      { text: 'Strategy and number games like Sudoku', category: 'math' },
      { text: 'Word games like Scrabble or crosswords', category: 'english' },
      { text: 'Role-playing or world-building games', category: 'social' },
    ],
  },
];
