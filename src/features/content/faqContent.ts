/**
 * FAQ content — parity with the site's /faq page (report §8.4, design.md
 * §E6). Static typed constants, updated via normal release (no CMS this
 * round). Source of truth is the site's FAQ data; ONE deliberate
 * divergence: membership pricing answers are PRICE-FREE in-app (owner
 * decision Q5 + App Store guideline 3.1.1 — checkout and pricing stay on
 * the site). A test guards that no dollar amounts creep in.
 */

export type FaqAudience = "homeowners" | "contractors";

export interface FaqEntry {
  q: string;
  a: string;
}

export interface FaqTopic {
  topic: string;
  qs: readonly FaqEntry[];
}

export const FAQ_CONTENT: Record<FaqAudience, readonly FaqTopic[]> = {
  homeowners: [
    {
      topic: "Finding & Hiring a Pro",
      qs: [
        {
          q: "How do I find a trusted contractor in Atlanta?",
          a: "Browse the Shmooze Certified registry, or use Find My Pro and we'll match you with a vetted local business for your job. Every pro has been vouched for by the community.",
        },
        {
          q: "Is it free for homeowners to use the Shmooze?",
          a: "Yes. Finding a pro, requesting a concierge match, and hiring through the Shmooze are always free. You never pay us anything.",
        },
        {
          q: "What home services can I find here?",
          a: "Plumbers, electricians, roofers, HVAC, landscapers, handymen, painters, cleaners, pest control, and many more home-service trades across metro Atlanta.",
        },
        {
          q: "How fast will a pro contact me after I request a match?",
          a: "Usually within a day. Our concierge routes your request to the right certified pro quickly, so you are not left waiting or chasing anyone down.",
        },
        {
          q: "Can I pick a specific business instead of being matched?",
          a: "Yes. Browse the registry and reach out to any Shmooze Certified business directly, or pick a Market Leader in your category yourself.",
        },
      ],
    },
    {
      topic: "Trust & Vetting",
      qs: [
        {
          q: "How are Shmooze businesses vetted?",
          a: "Every business is Shmooze Certified through our community. They are vouched for by neighbors who have hired them, and their track record is reviewed before they earn a listing.",
        },
        {
          q: "What does 'Shmooze Certified' mean?",
          a: "It is the trust seal every listed business earns. It signals they are a real, reachable local business the community stands behind, not a random ad.",
        },
        // Qualified vs the site's answer: live Google reviews on in-app
        // registry profiles land with the at-launch profile-depth work
        // (L2/L5) — do not promise them in this release (review: PR #35).
        {
          q: "Are the reviews on the profiles real?",
          a: "Yes. On the Southern Shmooze website, profile reviews are pulled live from Google with the reviewer's real name, and each profile links to the business's Google listing so you can verify for yourself. Live Google ratings are coming to profiles in the app soon.",
        },
        {
          q: "What if I have a bad experience with a pro?",
          a: "Email hello@thesouthernshmooze.com. Because these businesses answer to the same community you are part of, their reputation depends on doing right by you.",
        },
        {
          q: "Do you verify licensing and insurance?",
          a: "We review each business's track record and standing in the community. Licensing and insurance details on a profile are member-reported, so always confirm the specifics for your job.",
        },
      ],
    },
    {
      topic: "Costs & Payments",
      qs: [
        {
          q: "Does it cost anything to get matched with a pro?",
          a: "No. The concierge match and the entire homeowner experience are free.",
        },
        {
          q: "Do I pay the Shmooze or the contractor?",
          a: "You pay the contractor directly for their work. The Shmooze never handles or marks up your project payment.",
        },
        {
          q: "Are Shmooze pros more expensive?",
          a: "Pros quote you their normal rates directly, nothing is marked up by the Shmooze, and many offer member deals you will not find anywhere else.",
        },
        {
          q: "What are member deals?",
          a: "Some certified businesses offer exclusive discounts or perks to Shmooze homeowners. When a pro has one, it shows right on their profile.",
        },
        {
          q: "Is my information sold to a bunch of contractors?",
          a: "No. Unlike lead-gen sites, we do not sell your info to five businesses to fight over. Your request goes to one trusted pro.",
        },
      ],
    },
    {
      topic: "The Concierge Match",
      qs: [
        {
          q: "What is the Concierge Match?",
          a: "Tell us what you need and the concierge sends your request straight to the right certified pro for the job, one pro, not a bidding war, instead of you sifting through listings.",
        },
        // Qualified vs the site's answers: automatic Market Leader trade
        // rotation lands at launch (L4) — today the concierge team routes
        // each request to a trusted pro (review: PR #35).
        {
          q: "How does the concierge choose a business?",
          a: "The concierge routes your request to a trusted Shmooze Certified pro who fits the job. As the new registry rolls out, requests will route by trade to top-tier Market Leaders on a fair rotation so no one gets buried.",
        },
        {
          q: "What happens after I submit a request?",
          a: "Your matched pro is notified and reaches out to you directly. If they cannot take the job, the concierge routes you to the next trusted pro.",
        },
        {
          q: "Can I request a specific trade or service?",
          a: "Yes. You choose your category so the right specialist gets your request, whether it is roofing, plumbing, or landscaping.",
        },
        {
          q: "Is the concierge really free?",
          a: "Yes, completely free for homeowners.",
        },
      ],
    },
    {
      topic: "About the Community",
      qs: [
        {
          q: "What is The Southern Shmooze?",
          a: "An Atlanta community of 17,000+ homeowners and the trusted local businesses they hire, built on real word-of-mouth referrals.",
        },
        {
          q: "How do I join the community?",
          a: "Join the free Facebook group, where neighbors trade recommendations and find trusted pros every day.",
        },
        {
          q: "What area does the Shmooze cover?",
          a: "Metro Atlanta and the surrounding neighborhoods.",
        },
        {
          q: "Do you have a podcast or newsletter?",
          a: "Yes. Follow the Shmooze podcast and subscribe to the newsletter to keep up with local pros, stories, and events.",
        },
        {
          q: "Who started The Southern Shmooze?",
          a: "Atlanta's Grant Wallace founded it during the pandemic to bring the city's trusted local pros into one place. You can read his story on the About screen.",
        },
      ],
    },
  ],
  contractors: [
    {
      topic: "Joining & Getting Certified",
      qs: [
        {
          q: "How do I join The Southern Shmooze as a business?",
          a: "Tap Check My Fit right here in the app and apply. It takes about a minute, and applying is free.",
        },
        {
          q: "Is it free to apply and get certified?",
          a: "Yes. Applying and becoming Shmooze Certified are free. You only pay if you choose a paid level for more visibility.",
        },
        {
          q: "What does it take to get Shmooze Certified?",
          a: "Two things: you hold at least 4.0 stars across your Google reviews, and you serve metro Atlanta. That is the whole bar. You pick your own Google listing when you apply so we check the right business, and we read your rating straight from Google.",
        },
        {
          q: "What kinds of businesses can join?",
          a: "Home-service trades like roofing, plumbing, HVAC, electrical, landscaping, handyman, painting, cleaning, pest control, and more.",
        },
        {
          q: "How long does approval take?",
          a: "Seconds. You get your answer on the screen before you leave the page, because we check your Google rating live instead of putting you in a queue. Nobody sits waiting on a human to click approve.",
        },
        {
          q: "What if I don't have any Google reviews yet?",
          a: "You can still join. If there is no rating to check, you are approved and your profile goes live without stars, and your rating appears automatically the moment Google has one. Being new is not the same as being bad at the work.",
        },
        {
          q: "What happens if my rating is under 4.0?",
          a: "You are not certified yet, and you are not shut out either. We show you exactly what we saw and point you to the help page, and you can reapply the day you clear 4.0. There is no waiting period and no penalty for trying again.",
        },
      ],
    },
    {
      topic: "Membership Levels",
      qs: [
        // PRICE-FREE divergence from the site (Q5 / App Store 3.1.1):
        // no dollar amounts in-app; levels and pricing live on the site.
        {
          q: "How much does a Shmooze membership cost?",
          a: "Applying and certification are free. There are three paid visibility levels — Local Business, Established Business, and Market Leader — and you can move up or down anytime. Current pricing lives on the Southern Shmooze website.",
        },
        {
          q: "What do the paid levels get me?",
          a: "Local Business gets you found: the badge, your own profile page, your live Google rating, and weekly spotlights in the group. Established Business adds front page placement, a written audit of your online presence with a strategy call, and a free professional headshot. Market Leader adds concierge homeowner leads routed straight to you, a pinned featured slot on the homepage, a fresh audit every quarter, and first call on podcast bookings.",
        },
        {
          q: "What is a Market Leader?",
          a: "It is the top membership, the businesses that receive concierge homeowner leads routed directly to them in their category and area.",
        },
        {
          q: "Is there a free option for nonprofits?",
          a: "Yes. Registered nonprofits get a free community level.",
        },
        {
          q: "Can I change my membership level later?",
          a: "Yes, anytime. Move up when you are ready to grow, or down if you need to.",
        },
      ],
    },
    {
      topic: "Getting Leads & Referrals",
      qs: [
        {
          q: "How do I get leads from the Shmooze?",
          a: "Certification puts you in front of 17,000+ homeowners already asking who to hire. Market Leaders also get homeowner requests routed directly to them.",
        },
        {
          q: "Are these shared leads like other sites?",
          a: "No. We do not sell the same lead to five competitors. A concierge lead goes to you, not into a bidding war.",
        },
        // Qualified vs the site: fair trade rotation lands at launch (L4)
        // — same forthcoming framing as the neighboring answers
        // (review: PR #35).
        {
          q: "How are concierge leads assigned?",
          a: "Today the concierge routes each request to a trusted certified pro for the job. As rotation rolls out, leads will route by trade to Market Leaders on a fair rotation, so you get real, ready-to-hire homeowners in your category.",
        },
        {
          q: "What makes Shmooze leads different?",
          a: "They come warm, from a community that already trusts the Shmooze, so you are not a cold stranger fighting on price.",
        },
        // Qualified vs the site: the 2-hour claim window is part of the
        // rotation system that lands at launch (L4) — no hard deadline
        // promise until it ships (review: PR #35).
        {
          q: "How quickly do I need to respond to a lead?",
          a: "Fast. As lead rotation rolls out, you will have a 2-hour window to claim a lead before it moves to the next pro. Either way, the homeowner is waiting — the sooner you reach out, the better your odds of winning the job.",
        },
      ],
    },
    {
      topic: "Growth Studio (Marketing)",
      qs: [
        {
          q: "What is the Shmooze Growth Studio?",
          a: "An in-house team, the crew behind Atlanta Pro Network, that runs your marketing when you are ready to scale: GBP optimization, reviews, websites, SEO, ads, video, and more.",
        },
        {
          q: "What service should I start with?",
          a: "Most members start with GBP optimization plus review generation. It is the quickest win and climbs you up the Google map pack fast.",
        },
        {
          q: "Do you run Google and Facebook ads?",
          a: "Yes. We run targeted, tracked paid campaigns aimed at homeowners ready to hire, not spray-and-pray ads to strangers.",
        },
        {
          q: "Are there fixed packages or long contracts?",
          a: "No cookie-cutter packages. Every engagement is scoped and quoted to your business and your goals.",
        },
        {
          q: "Do I have to buy marketing to be a member?",
          a: "No. Growth Studio is optional. You can be certified and grow through referrals without ever buying a service.",
        },
      ],
    },
    {
      topic: "Reviews, Profiles & Visibility",
      qs: [
        {
          q: "How do I get more reviews?",
          a: "Growth Studio can set up automated review requests, and the community runs review campaigns that reward the most-reviewed businesses.",
        },
        // Qualified vs the site: ratings/badges/deals describe the WEBSITE
        // profile; in-app registry profiles gain them with the at-launch
        // profile-depth work (review: PR #35).
        {
          q: "What shows on my business profile?",
          a: "Your profile on the Southern Shmooze website shows your logo, trade, service area, live Google rating and reviews, earned badges, any member deal, and a Leave a Review button. In-app registry profiles show your core business details today, with ratings and badges rolling out.",
        },
        {
          q: "What are the earned badges?",
          a: "Shmooze Certified is the vetting seal every member carries. Top Rated and 10+ Years come straight from real data and cannot be bought. Market Leader is different, it simply means that business receives concierge requests directly.",
        },
        {
          q: "How do my Google reviews get on my profile?",
          a: "We pull them live from your Google Business Profile, so your real rating and latest reviews show up automatically.",
        },
        {
          q: "How do I stand out in the registry?",
          a: "Keep your rating strong, respond fast, and consider a higher visibility level or Growth Studio help. Top Rated and Market Leader badges get the spotlight.",
        },
      ],
    },
  ],
};
