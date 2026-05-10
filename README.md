<div align="center">

# 🌸 Glow

### A free, open-source period & fertility tracker built for women who deserve better.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-violet?style=flat-square)

**No subscriptions. No ads. No cloud. Your data stays yours.**

</div>

---

## What is Glow?

Glow is a modern period and fertility tracking web app inspired by apps like Flo — but completely free, open source, and self-hosted. Your health data never leaves your own machine or server. There are no accounts sold to advertisers, no paywalled insights, and no subscription fees. Just a beautiful, private app that helps women understand their bodies.

Built with love for my wife Jen, and open to every woman who deserves a better tool.

---

## ✨ Features

- **Period tracking** — log flow intensity, symptoms, mood, and notes for any day
- **Ovulation tracking** — log BBT, cervical mucus, LH surge, and confirmed ovulation
- **Cycle predictions** — predicts your next period, ovulation date, and fertile window based on your real data
- **Fertility score** — daily fertility percentage based on where you are in your cycle
- **Fertile window highlighting** — clearly shows your peak conception days
- **Cycle phase guidance** — personalized tips, foods, and exercise recommendations for each phase (menstrual, follicular, ovulation, luteal)
- **Interactive calendar** — visual month view with period days, fertile days, and ovulation marked
- **Insights & analytics** — cycle history, average lengths, trends over time, and BBT charting
- **Profile settings** — customizable cycle and period length (supports cycles up to 60 days), trying-to-conceive mode
- **Secure login** — email/password authentication, fully local with no third-party auth services
- **Fully responsive** — works great on mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via [Prisma 5](https://prisma.io) |
| Auth | [NextAuth v4](https://next-auth.js.org) (credentials) |
| Charts | Recharts |
| Icons | Lucide React |
| Date utils | date-fns |

No cloud services. No external APIs. Everything runs locally.

---

## 🚀 Getting Started

### Requirements

- Node.js 20.9.0 or later
- npm

### Local development

```bash
# Clone the repo
git clone https://github.com/bigrigsteve/glow.git
cd glow

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Create your environment file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXTAUTH_SECRET=your-random-secret-here   # generate with: openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000
```

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your account.

---

## 🐳 Self-Hosting with Docker

Docker is the recommended way to self-host Glow, especially on servers with older system libraries (e.g. CentOS 7).

### 1. Build the image

```bash
docker build -t glow .
```

### 2. Run the container

```bash
docker run -d \
  --name glow \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /your/data/path:/app/prisma \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=https://yourdomain.com/glow \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  glow
```

### 3. Initialize the database

```bash
docker exec glow npx prisma db push
```

### 4. nginx reverse proxy

Add this to your existing nginx server block:

```nginx
location /glow {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}
```

> **CentOS 7 users:** Run `sudo setsebool -P httpd_can_network_connect 1` to allow SELinux to permit the nginx proxy connection.

### Updating

```bash
docker build -t glow . && docker rm -f glow && docker run -d \
  --name glow --restart unless-stopped -p 3000:3000 \
  -v /your/data/path:/app/prisma \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=https://yourdomain.com/glow \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  glow
```

---

## 🗄 Database

Glow uses SQLite — a single file database that requires no server, no configuration, and no maintenance. Your data is stored in `prisma/dev.db`. Back it up by simply copying that file.

The schema includes:

- `User` — account credentials
- `Profile` — cycle settings and preferences
- `PeriodLog` — daily period logs (flow, symptoms, mood, notes)
- `OvulationLog` — ovulation tracking data (BBT, cervical mucus, LH surge)
- `Cycle` — historical cycle records

---

## 🔒 Privacy

Glow is designed from the ground up with privacy in mind:

- **No cloud services** — everything runs on your own machine or server
- **No telemetry** — zero data sent anywhere
- **No third-party auth** — passwords are hashed with bcrypt and stored locally
- **No ads, ever** — this is free software, not a product

---

## 🤝 Contributing

Contributions are welcome. If you'd like to improve Glow — whether it's a bug fix, a new feature, or better documentation — feel free to open a pull request.

Some ideas for future features:

- PWA support (installable on phone)
- Dark mode
- Cycle history CSV import/export
- Email reminders
- BBT charting on the insights page
- Multi-language support

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ for Jen, and every woman who deserves free, private healthcare tools.

</div>
