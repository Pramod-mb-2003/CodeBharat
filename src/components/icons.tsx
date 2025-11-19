import { Dumbbell, Atom, BookOpen, Palette, Globe, Calculator, LucideProps } from 'lucide-react';

export const InterestIcons = {
  sports: (props: LucideProps) => <Dumbbell {...props} />,
  science: (props: LucideProps) => <Atom {...props} />,
  english: (props: LucideProps) => <BookOpen {...props} />,
  creativity: (props: LucideProps) => <Palette {...props} />,
  social: (props: LucideProps) => <Globe {...props} />,
  math: (props: LucideProps) => <Calculator {...props} />,
};
