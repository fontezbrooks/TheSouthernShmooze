To set up PostHog analytics and dashboards for the mobile app version of **The Southern Shmooze**, we must shift from a traditional "pageview-only" web analytics mindset to a **full-journey product analytics approach** 1, 2\.  
In a community marketplace like yours, the user's journey does not start at sign-up or lead submission; it continues from there 3\. PostHog allows you to **build a user profile the exact second an anonymous user launches the app**, capturing their initial marketing campaign sources and tracking their behaviors continuously as they transition to identified homeowners or contractors 2-4.  
The core analytical question your dashboards must answer is: **"What did they do in the app, and where did they come from when they did it?"** 5\. Here is how to map your user stories to ideal KPIs, custom events, and PostHog-specific dashboards.

### Dashboard 1: Homeowner Acquisition & Discovery Dashboard

This dashboard is dedicated to the **"S" (Acquisition Source)** of the SOAR framework 6, 7\. It focuses on how homeowners enter the app and interact with the registry search, filtering, and the "Shmoozer" swiper card layout (US-1, US-4).

#### Ideal KPIs & Metrics

* **Unique Active Homeowners:** A **Scorecard widget** tracking unique app-open events over 7-, 30-, and 90-day intervals 7, 8\.  
* **Search and Filter Conversion Rate:** The percentage of users who perform a search and successfully click into a pro's profile 9, 10\.  
* **Empty State Encounter Rate:** The percentage of search/filter combinations that return zero matches (triggering the concierge offer). *This is a critical operational KPI to identify Atlanta neighborhoods or service categories where you lack certified pros.*  
* **Swiper Engagement & Match Rate:** Average swipes per user session and the conversion rate of right-swipes to successful concierge connections (US-4).

#### PostHog Implementation & Events

* **User Profile Properties:** Capture $creator\_utm\_source, $creator\_utm\_medium, and $creator\_utm\_campaign on the initial app launch to track which paid Facebook/Google ads or local community links drove the download 2, 11, 12\.  
* **Event registry\_search\_performed:** Track properties like category (e.g., "Plumbing"), tier (e.g., "Market Leader"), badge\_filter, and results\_count (US-1).  
* **Event empty\_state\_rendered:** Track properties like attempted\_category and attempted\_tier when a search yields zero matches.  
* **Event card\_swiped:** Track properties like pro\_business\_id, tier, and swipe\_direction ("left" or "right") (US-4).

### Dashboard 2: "Find My Pro" & Profile Conversion Funnel

This dashboard tracks the core conversion outcomes—turning passive browsers into active leads (US-2, US-3). It answers whether your profiles and matching funnels are highly effective 13, 14\.

#### Ideal KPIs & Metrics

* **Lead Funnel Completion Rate:** A multi-step funnel tracking progress from initiating "Find My Pro" to completing Step 2 9\.  
* **Partial Lead Abandonment Rate:** The volume and percentage of users who quit after Step 1 but provided contact/category info (US-2). *This allows your concierge operations team to immediately act on high-intent partial leads.*  
* **Outbound Review Verification Rate:** The percentage of profile views that click "Open Google Reviews" (US-3). *This measures how heavily homeowners rely on external trust validation before contacting a pro.*  
* **Direct Inbound Connection CTR:** The click-through rate of the "Call" button on matched profiles or results screens (US-2).

#### PostHog Implementation & Events

1. **Funnel Insight Setup:** Create a step-by-step funnel using these custom events 9:  
2. find\_my\_pro\_started (Step 1\)  
3. find\_my\_pro\_step\_1\_completed (Properties: category, neighborhood, partial\_lead\_recorded \= true) (US-2)  
4. find\_my\_pro\_completed (Step 2 \- Preferred partner displayed)  
5. partner\_call\_button\_clicked (Properties: pro\_business\_id, tier)  
6. **Custom Math Formula for Conversion Rate:** Add a scorecard to the top of your dashboard showing the conversion rate using PostHog’s formula option (e.g., B / A where B is find\_my\_pro\_completed and A is find\_my\_pro\_started), formatted as a percentage 15, 16\.  
7. **Event profile\_engagement:** Track clicks on profile elements (US-3). Track properties like pro\_business\_id, has\_photos (true/false), has\_deal (true/false), and action\_type ("opened\_reviews", "read\_editorial", "clicked\_deal") to monitor if lighter profiles render or convert differently.

### Dashboard 3: Contractor Growth & Qualification Funnel

Your app must also cater to the B2B side—onboarding local service businesses and contractors (US-5).

#### Ideal KPIs & Metrics

* **Contractor Portal Click-Through Rate:** The percentage of overall app visitors who navigate to the "I run a business" entry point.  
* **Qualification Inbound Conversion Rate:** A funnel tracking the transition from entering the contractor portal to submitting the qualification form.  
* **Source Performance for B2B:** A breakdown of qualified contractor leads sorted by UTM campaign, helping you identify which local business groups, SEO efforts, or offline trade show campaigns are driving contractor sign-ups 2, 17, 18\.

#### PostHog Implementation & Events

* **Event contractor\_portal\_viewed:** Track the entry point (e.g., drawer menu, profile page, footer) to see where business owners are discovering the portal.  
* **Event qualification\_form\_started:** Capture the company name and trade category properties.  
* **Event qualification\_form\_submitted:** Track instant\_response\_status (approved, flagged, or concierge-review-required) to ensure your app's automated response mirrors the website's rapid speed (US-5).

### Dashboard 4: Registry Sync & Operations (Product Health)

To ensure the app operates seamlessly without requiring a new app store release whenever registry data changes, you must track backend sync health directly alongside user metrics (US-6).

#### Ideal KPIs & Metrics

* **Sync Latency / Refresh Interval:** The duration (in milliseconds) and frequency of automated registry updates flowing into the app.  
* **Sync Success Rate:** The percentage of app launches that successfully pull down upstream registry updates and ratings refreshes.

#### PostHog Implementation & Events

* **Event registry\_sync\_completed:** A developer-focused custom event tracking properties like records\_updated, duration\_ms, and sync\_status ("success" or "failed").  
* **Event ratings\_cache\_refreshed:** Logged when the app pulls updated ratings independently of a full registry sync.

### PostHog Dashboard Layout Best Practices

To make these insights highly actionable for your team:

1. **Place Strategic Scorecards at the Top:** Use large unique user count and overall conversion rate percentage scorecards at the very top of each dashboard so you can evaluate overall health at a single glance 7, 8, 15, 16\.  
2. **Utilize Trend Lines:** For your funnels and conversions, include trend lines over time to see if product tweaks (e.g., changes to the swiper model or the 2-step lead capture) are positively impacting numbers week-over-week 13, 19, 20\.  
3. **Add Explanatory Notes:** Use PostHog's text description cards at the top-right or top-left of each dashboard to clearly define the dashboard's objective (e.g., *"This dashboard tracks the conversion rate of homeowners looking for Atlanta plumbing pros"*), ensuring everyone on your team aligns on what "good" looks like 13, 14, 21\.

📊 Would you like me to generate a structured data schema or a CSV file outlining all the exact events, properties, and user traits you need to pass to your developers for this PostHog implementation?  
