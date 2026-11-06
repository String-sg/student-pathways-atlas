# Post-Secondary Pathway Explorer

An unofficial, single-page tool for students sitting the Singapore-Cambridge Secondary Education Certificate (SEC) from 2028. Enter each subject's level (G1, G2, G3) and result, and the app shows which post-secondary pathways you meet the minimum requirements for.

## Features

- Set the level and result for each subject, or mark it as not taken
- Instant results, sorted into **Eligible or can apply** and **Not eligible**, with colour keys for "possible, with conditions"
- Covers 3-Year and 2-Year Higher Nitec, NAFA Foundation Programme, arts institutions, Polytechnic Foundation Programme, Polytechnic Year 1, Millennia Institute and Junior College
- Aggregate calculations such as ELR2B2, ELR2B2-C, L1R4 and ELMAB3
- Overview table of post-secondary admissions and a glossary of terms
- G3-to-G2 conversion and pass-mark reference tables
- **Save Grades** keeps your entries on your device (browser `localStorage`); **Reset** clears them
- Responsive layout, keyboard and screen-reader support, and installable as a home-screen app

## Usage

No build step or dependencies. Open `index.html` in a browser, or host the folder on any static host such as GitHub Pages.

Fonts load from Google Fonts, so an internet connection is needed for the intended typography. The app falls back to system fonts without one.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page markup, overview and glossary dialogs |
| `style.css` | Styling |
| `script.js` | Eligibility logic, rendering and saving |
| `manifest.webmanifest` | Web app manifest for "Add to Home Screen" |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons |

## Data and privacy

Everything runs in your browser. Grades are never sent anywhere. They are stored locally only if you press **Save Grades**.

## Disclaimer

This is an unofficial guide based on MOE's 2028 post-secondary pathways chart and its summary of admissions criteria. It shows only whether a student meets the **minimum** requirements. Entry into a specific course also depends on its cut-off point, subject requirements and competition for places.

For official information, see the [MOE Post-Secondary Admissions Exercise](https://www.moe.gov.sg/post-secondary/admissions/pse) and [MOE CourseFinder](https://www.moe.gov.sg/coursefinder).

## Licence

&copy; 2026 Mathew Lim. Experimental app. All rights reserved.
