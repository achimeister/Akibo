# 🪷 Akibo — Guida al Deploy

## Come pubblicare Akibo online (gratuito, 10 minuti)

### Passo 1 — Crea un account GitHub
1. Vai su [github.com](https://github.com) e clicca **Sign up** (è gratis)
2. Scegli un username, email e password
3. Verifica l'email

### Passo 2 — Carica il progetto su GitHub
1. Clicca sul tasto **+** in alto a destra → **New repository**
2. Nome: `akibo` 
3. Lascia tutto il resto di default → **Create repository**
4. Clicca **uploading an existing file**
5. Trascina TUTTI i file di questa cartella (mantenendo la struttura: `src/`, `public/`, `package.json`)
6. Clicca **Commit changes**

### Passo 3 — Pubblica su Vercel
1. Vai su [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Clicca **Add New Project**
3. Seleziona il repository `akibo`
4. Lascia tutto di default (Vercel riconosce React in automatico)
5. Clicca **Deploy**

Dopo 1-2 minuti il tuo sito sarà online a un indirizzo tipo:
**`https://akibo-tuonome.vercel.app`**

---

## Usare Akibo su iPhone
1. Apri Safari su iPhone
2. Vai all'indirizzo Vercel
3. Tocca l'icona **Condividi** (il quadrato con la freccia)
4. Scorri e tocca **Aggiungi a schermata Home**
5. Akibo apparirà come un'app vera!

---

## Come trasferire i dati tra dispositivi

I dati si salvano **automaticamente** nel browser che usi. Se vuoi usarli su un altro dispositivo:

1. **Sul dispositivo attuale:** clicca 💾 in alto a destra → scarica il file JSON
2. **Sul nuovo dispositivo:** apri Akibo → clicca 📂 → seleziona il file JSON
3. I tuoi dati appariranno immediatamente

---

## Sviluppo locale (opzionale)
Se vuoi modificare l'app sul tuo Mac:
```bash
# Installa Node.js da https://nodejs.org prima
npm install
npm start
```
L'app si aprirà su http://localhost:3000
