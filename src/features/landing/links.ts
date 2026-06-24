/** External destinations. Out-of-scope sections open the live site (in-app browser). */
const SITE = 'https://www.shmoozeatl.com';

export const LINKS = {
  membership: `${SITE}/membership`,
  directory: `${SITE}/directory`,
  resources: `${SITE}/resources`,
  facebook: 'https://www.facebook.com/groups/TheSouthernShmooze',
  newsletter: 'https://thesouthernshmooze.substack.com/',
  email: 'mailto:hello@thesouthernshmooze.com',
} as const;
