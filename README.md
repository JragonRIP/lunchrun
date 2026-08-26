# Lunch Run — Production Launch Guide

School snack ordering and pickup. Students order before lunch. You shop and deliver during lunch.

**Pay model:** actual store price + Lunch Run fee once per order (default $1.50). Cash prepay.

---

## 1. Create Supabase

1. Go to [https://supabase.com](https://supabase.com) → New project  
2. Copy **Project URL**, **anon public** key, and **service_role** key (Settings → API)  
3. Open **SQL Editor** and run, in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/seed.sql`
4. **Authentication → Users → Add user** (email + password for you)
5. Copy that user’s UUID, then run:

```sql
insert into public.admins (id, email, display_name)
values ('PASTE-USER-UUID-HERE', 'you@school.edu', 'Operator')
on conflict (id) do nothing;
```

---

## 2. Local env (optional test)

Copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PRICE_IMPORT_API_KEY=long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

- Student app: http://localhost:3000  
- Admin: http://localhost:3000/admin/login (your Supabase email/password)

Without these env vars, the app stays in **demo mode** (sample data, resets on restart).

---

## 3. Deploy on Vercel

1. Push this repo to GitHub  
2. [vercel.com/new](https://vercel.com/new) → Import the repo  
3. Add the same env vars as above  
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL, e.g. `https://lunch-run.vercel.app`  
5. Deploy  

After the first deploy, update `NEXT_PUBLIC_SITE_URL` if the domain changed, then redeploy. Print the QR from **Admin → QR Code**.

---

## 4. Go-live checklist

- [ ] Supabase schema + seed applied  
- [ ] Your user is in `admins`  
- [ ] Vercel env vars set (including **service role**)  
- [ ] Login works at `/admin/login`  
- [ ] Place a test student order  
- [ ] Confirm it appears in Admin → Orders  
- [ ] Settings: fee, cutoff, delivery spots, max orders  
- [ ] Products: replace placeholder image URLs  
- [ ] Print QR / share link with students  

---

## 5. Day-of operator flow

1. Confirm **Today’s Run** is open (Settings / Dashboard)  
2. Students order on phone before cutoff  
3. **Shop** → enter shelf prices → Finish Shopping  
4. **Deliver** → enter cash paid → change → Mark Delivered  

---

## Demo vs production

| | Demo (no env) | Production (Supabase + Vercel) |
|--|--|--|
| Data | In-memory sample | Postgres (persistent) |
| Admin login | `admin@lunchrun.local` / `lunchrun` | Your Auth user |
| Orders survive restart | No | Yes |

---

## Price import (optional)

```http
POST /api/admin/prices/import
Authorization: Bearer $PRICE_IMPORT_API_KEY
```

Only send legally obtained public product data. Uncertain matches go to **Needs Review**.

---

## Scripts

| Command | Purpose |
|--|--|
| `npm run dev` | Local (webpack) |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run lint` | Lint |

---

## Support notes

- Fee is **once per order**, not per item  
- Never buy above a student’s max without approval  
- Merchandise is reimbursement; fees are service revenue  
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser  
