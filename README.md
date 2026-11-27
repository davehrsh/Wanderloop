# Wanderloop

A frontend-only hotel marketplace concept. Paris, 15–17 January 2027 is the reference scenario. All offers, terms, payment outcomes and bookings are illustrative; no real suppliers, payment gateways or affiliate integrations are connected.

## Run
Download `demo.html` and open it directly for a fully self-contained offline version. No external assets or network requests are needed.

Open index.html in a browser, or serve the directory with `python -m http.server 8000` and visit http://localhost:8000. No build or npm dependencies.

## Demo walkthrough
1. Compare the 9Hotel République direct offer (€340 payable + €4 future credits) with the equivalent external €336 offer. The €400 breakfast-inclusive flexible room is separate.
2. Choose Wanderloop. Use **Use sample details**, review the quote, choose a simulated payment, consent and confirm.
3. Try a declined payment and retry with approval. No actual payment details are requested.
4. Open **My trips** (or the account menu on mobile). Simulate stay completion to move earned credits into the available wallet. Apply those credits to a subsequent direct booking.
5. Cancel a flexible booking to demonstrate refunds and credit restoration; non-refundable cancellations do not receive a refund.
6. Choose a partner offer to simulate the separate partner checkout. No Wanderloop credits apply.
7. Under account > Demo controls, switch between control, price match, credits-only and hybrid treatments for the reference hotel. The demo does not measure causal lift or actual profitability.

LocalStorage persists only demo trip references, terms, totals, status and credit balance, not guest contact or payment information. Reset the demo using the Demo controls screen. Original vector artwork is illustrative, not a depiction of the actual hotels. The confidential assessment and third-party screenshots are not included.

## Hosting
Static hosting works from the repository root. For GitHub Pages, select Settings > Pages > Deploy from a branch > main > / (root), then Save. No backend required.
