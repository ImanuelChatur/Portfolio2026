export interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

// Projects and Writeups join this list when their pages exist (content handoff).
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/', exact: true },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const SOCIAL = {
  email: 'charliechatur@gmail.com',
  github: 'https://github.com/ImanuelChatur',
  linkedin: 'https://linkedin.com/in/imanuel-chatur'
};
