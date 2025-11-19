import { InterestIcons } from '@/components/icons';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type Interest = {
  name: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
};

export const INTERESTS: Record<string, Interest> = {
  sports: { name: 'Sports', Icon: InterestIcons.sports },
  science: { name: 'Science', Icon: InterestIcons.science },
  english: { name: 'English', Icon: InterestIcons.english },
  creativity: { name: 'Creativity', Icon: InterestIcons.creativity },
  social: { name: 'Social Studies', Icon: InterestIcons.social },
  math: { name: 'Math', Icon: InterestIcons.math },
};

export const ALL_INTEREST_KEYS = Object.keys(INTERESTS);
