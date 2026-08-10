/**
 * About/press/community content — parity with the site's /about page
 * (design.md §E6). Static typed constants, updated via normal release.
 */

export const ABOUT_STORY: readonly { heading?: string; body: string }[] = [
  {
    body: "What started as one Atlanta neighbor trying to keep track of the good local contractors became a 17,000-member community, and a movement to put trust back at the center of hiring a pro.",
  },
  {
    body: "Grant Wallace just got tired of watching good people slip through the cracks. Honest Atlanta businesses doing beautiful work and going unnoticed, while homeowners had nothing to go on but cold ads and lead sites hawking their number to five companies at once. It bugged him enough that he did something about it.",
  },
  {
    body: "When 2020 flipped everything upside down, Grant spun up a simple Facebook group so neighbors could vouch for the contractors they'd actually hired. Humble little idea. It took off anyway.",
  },
  {
    heading: "An entrepreneur's heart, pointed at the whole city.",
    body: "Grant knows the contractor side firsthand. He runs Grantlanta Lawn, one of the founding businesses of the Shmooze. Years of mowing lawns taught him how hard it is for good operators to go toe to toe with big ad budgets. The Shmooze is his answer: earn the work with your reputation, not your ad spend.",
  },
  {
    heading: "Family guy first, everything else second.",
    body: "At home, Grant's just a dad. He lives around Atlanta with his wife and their two little ones. He'll tell you he doesn't really think of the Shmooze as a company — it's something he hopes is still standing when his kids are grown: neighbors looking out for neighbors, doing honest work and building good lives on it.",
  },
  {
    body: "These days the community powers a certified registry, a concierge that matches homeowners with the right pro, and a growth studio that helps those businesses scale. But the Facebook group is still the beating heart, a front porch where Atlanta finds the folks who take care of its homes.",
  },
];

export const PRESS_ITEMS: readonly {
  outlet: string;
  title: string;
  url: string;
}[] = [
  {
    outlet: "WABE",
    title:
      "Atlanta entrepreneur expands The Southern Shmooze into a local business database",
    url: "https://www.wabe.org/atlanta-entrepreneur-expands-the-southern-shmooze-facebook-group-into-local-business-database/",
  },
  {
    outlet: "Atlanta News First",
    title: "For some Atlanta businesses, work is all about 'The Shmooze'",
    url: "https://www.atlantanewsfirst.com/2026/02/17/some-atlanta-businesses-work-is-all-about-shmooze/",
  },
];

export const COMMUNITY_LINKS: readonly {
  label: string;
  description: string;
  url: string;
}[] = [
  {
    label: "Facebook Group",
    description: "The front porch — 17,000+ neighbors trading recommendations.",
    url: "https://www.facebook.com/groups/TheSouthernShmooze",
  },
  {
    label: "The Shmooze Podcast",
    description: "Local pros, stories, and events from around Atlanta.",
    url: "https://rss.com/podcasts/the-southern-shmooze/",
  },
  {
    label: "The Newsletter",
    description: "Local finds and happenings, straight to your inbox.",
    url: "https://thesouthernshmooze.substack.com/",
  },
  {
    label: "Instagram",
    description: "The Shmooze around town, in pictures.",
    url: "https://www.instagram.com/shmoozeatl",
  },
  // The site publishes no dedicated meetup URL — gatherings are announced
  // in the Facebook group, so that is the honest destination (E6 review).
  {
    label: "Monthly Meetups",
    description:
      "Get to know the real people behind the businesses — announced in the Facebook group.",
    url: "https://www.facebook.com/groups/TheSouthernShmooze",
  },
];
