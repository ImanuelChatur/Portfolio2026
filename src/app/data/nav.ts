export interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/', exact: true },
  { label: 'Projects', path: '/projects' },
  { label: 'Writeups', path: '/writeups' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const SOCIAL = {
  email: 'charliechatur@gmail.com',
  github: 'https://github.com/ImanuelChatur',
  linkedin: 'https://linkedin.com/in/imanuel-chatur'
};
