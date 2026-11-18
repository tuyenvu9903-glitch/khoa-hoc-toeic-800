---
name: ship
description: Check, commit and push changes to GitHub so the site redeploys. Use when the user says push, deploy, đẩy lên, cập nhật lên web, or asks to publish changes.
---

# Ship changes

1. In `web/`, run all three and stop if any fails (fix it, or report the failure output):
   ```bash
   npm run typecheck && npm test && npm run build
   ```
2. From the repo root, review `git status --short`. Local copies may lack `api/` and
   `docker-compose.yml`, which then show as deleted: never stage those deletions.
   Stage only what changed, e.g. `git add web .claude CLAUDE.md README.md` — never `git add -A`.
3. Commit with a short English summary line and a few bullet points of what changed for the learner.
4. `git push origin main`.
5. Check the deploy (no auth needed):
   ```bash
   curl -s "https://api.github.com/repos/tuyenvu9903-glitch/khoa-hoc-toeic-800/actions/runs?per_page=4" \
     | python -c "import sys,json;[print(r['name'],r['head_sha'][:7],r['status'],r['conclusion']) for r in json.load(sys.stdin)['workflow_runs']]"
   ```
   If a "pages build and deployment" run appears next to "Deploy to GitHub Pages", the Pages source
   is still "Deploy from a branch" and the README will overwrite the app. Tell the user to switch
   Settings → Pages → Source to **GitHub Actions** and re-run the workflow.
6. Tell the user (in Vietnamese) the commit hash, what changed, and that the site
   https://tuyenvu9903-glitch.github.io/khoa-hoc-toeic-800/ updates in 1–2 minutes (Ctrl+F5).
