# William Rydh-dokumentationen

En statisk dokumentredovisning som jämför Borås Tidnings publiceringar om
William Rydh med avtal, fakturor, produktdata, originalljud, samtida
handlingar och en fullständig dokumentleverans om 81 filer.

## Lokal och extern förhandsvisning

Cloudflared-binären behöver finnas på `/tmp/cloudflared-bin/cloudflared`.
Kör därefter från denna mapp:

```sh
npm run dev
```

Kommandot:

- öppnar sajten lokalt på `http://localhost:4173`,
- skapar en tillfällig offentlig HTTPS-länk via Cloudflare Quick Tunnel,
- renderar en desktopbild,
- genomför riktig mobil-QA i 390×844 CSS-pixlar.

Quick Tunnel-länken saknar upptidsgaranti och ändras när processen startas om.
För permanent publicering behövs en riktig webbhost och domän.

## Senaste mobil-QA

Den 11 juni 2026 verifierades:

- viewport: 390×844 CSS-pixlar,
- dokumentbredd: exakt 390 pixlar,
- synlig mobilmeny,
- beviskort i en kolumn,
- inga oavsiktligt överströmmande element,
- avsiktligt horisontellt svepbara bevisfilter.

## Publiceringsprincip

Sajten organiserar bevisningen efter funktion:

- dokument som motsäger centrala publicerade uppgifter,
- leverans, ansvarskedja och Williams ansvarstagande,
- utelämnade sammanhang och den bild som gavs till läsarna,
- den dokumenterade skadan.

Råa kundavtal, personnummer, privata kontaktuppgifter och känsligt
tredjemansmaterial ingår inte i den publika sajten.

## Före extern publicering

1. Låt jurist granska formuleringar, publiceringsansvar och personuppgifter.
2. Begär och publicera Borås Tidnings bemötande på en tydlig plats.
3. Säkra rätt att återpublicera eventuella artikelutdrag och bilder.
4. Skapa redigerade, maskerade källkopior för de underlag som ska kunna laddas ned.
5. Lägg till kontaktväg, rättelsepolicy, integritetspolicy och versionshistorik.

## Filer

- `index.html` – innehåll och struktur
- `styles.css` – responsiv visuell form
- `app.js` – bevismatris, filter, navigation och läsprogress
- `assets/` – två befintliga bildutdrag som används i sidan
