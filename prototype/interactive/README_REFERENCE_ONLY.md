# Reference Prototype — Not Production Architecture

This folder contains a static HTML/CSS/JavaScript prototype used to validate tone, navigation, and happy-path behavior.

It is useful for:

- Seeing intended copy and interaction rhythm.
- Inspecting mobile and desktop states.
- Running the included smoke test.
- Comparing future production screenshots.

It is not suitable as the production foundation because it has no real authentication, database, RLS, transactional domain services, provider integrations, or production state management.

Do not “upgrade” this folder into the production app. Build fresh code in `apps/web` and keep this folder stable as a reference.

To inspect locally:

```bash
cd reference-prototype
python3 -m http.server 8080
# open http://localhost:8080
python3 tests/smoke.py
```
