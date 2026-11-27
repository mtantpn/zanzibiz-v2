# ZanziBiz V2 design direction

Agreed starting point, 27 Nov 2026. Prototype: `design/prototype/index.html` (open `preview.html` for phone, tablet and desktop views).

## What we learned from comparable platforms

| Platform | Pattern worth copying | How ZanziBiz uses it |
| --- | --- | --- |
| Airbnb | One calm search bar, a scrolling row of category icons, photos as the main trust signal, near-black text on white, one accent colour for the main action | Pill search (What / Where / Search), icon category bar under the hero, photo-first cards with no boxes, yellow only on the main button |
| Google Maps, Yelp | "Open now", area and category filters, hours and directions on every listing | Open-now status on cards, area and category chips, hours table and Map button on listings |
| Yellow Pages Kenya, BusinessList.co.ke | People use directories to compare providers in one place, trust verified listings, and want one-tap calling | WhatsApp and Call on every card, owner-managed and updated labels, "List your business free" |

Tanzania context (DataReportal, Digital 2026): about 20.6 million internet users (29% of people) against 89 million mobile connections. Design phone-first, keep pages light, and make WhatsApp the main action.

## Visual rules

- **Canvas:** white, generous spacing (8px scale), max width 1280px.
- **Type:** Plus Jakarta Sans for everything. Headlines 800 weight, body 400 or 500.
- **Colour:** ink `#1D2427` for text. Zanzibar yellow `#FFC72C` for the logo and the main action, a nod to the original "yellow pages" idea. Flag blue `#0A6A94` for links. Green `#1A7F45` only for WhatsApp and "open" status. A thin blue, black and green flag stripe appears in the eyebrow and footer.
- **Photos:** real local photos carry the colour. The hero uses one local image with its place named on it. Every photo is credited on the Photo credits page.
- **Cards:** photo on top, text below, no borders or shadows. Shadows only on the search bar and the listing contact box.

## Homepage order

1. Hero: eyebrow, headline, one-line promise, search, four popular searches, three proof numbers, local photo.
2. Category icon bar.
3. Open now (4 businesses).
4. Explore by area.
5. Travel guide (secondary).
6. For business owners (yellow band).
