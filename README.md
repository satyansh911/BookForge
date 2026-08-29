<div align="center">

# 📖 BookForge

### Write it. Ingest it. Hear it. Ship it.

An AI-native authoring studio and reading environment. Generate a book from a single
prompt, or ingest a PDF or a URL and turn it into a chaptered, annotatable, narratable
work — then export it as a typeset PDF or DOCX.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📑 Table of Contents

- [What BookForge Does](#-what-bookforge-does)
- [System Architecture](#-system-architecture)
- [Data Model](#-data-model)
- [API Reference](#-api-reference)
- [Key Flows](#-key-flows)
  - [Book Synthesis](#1-book-synthesis-prompt--finished-draft)
  - [Model Fallback Ladder](#2-the-model-fallback-ladder)
  - [PDF & URL Ingestion](#3-pdf--url-ingestion)
  - [The Reader](#4-the-reader-annotations-bookmarks-tts)
  - [Export Pipeline](#5-export-pipeline)
  - [Freemium Gating](#6-freemium-gating)
  - [Manga Hub](#7-manga-hub--social)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Scaling Playbook](#-scaling-playbook)
- [Roadmap](#-roadmap)

---

## ✨ What BookForge Does

BookForge is three products stacked into one app:

```mermaid
mindmap
  root((BookForge))
    ✍️ Author
      AI outline from a topic
      Per-chapter AI drafting
      Markdown editor
      Drag-to-reorder chapters
      Cover upload
      "Continue this story"
    📥 Ingest
      PDF to chapters
      URL scrape to chapters
      Auto-segmentation
    📚 Read
      Paginated reader
      Highlights and quotes
      Bookmarks
      Resume where you left off
      Tap-a-word definitions
      Text-to-speech narration
    📤 Export
      Typeset PDF
      Styled DOCX
    🎌 Social
      Manga hub
      Character leaderboard
      Discussion threads
      Google Books market links
```

| Pillar | What you get |
| --- | --- |
| **Author** | Give a topic, style, and chapter count → Gemini returns a structured outline. Draft each chapter individually, edit in Markdown, reorder with drag-and-drop. |
| **Ingest** | Upload a text-readable PDF or paste a URL. BookForge extracts, chunks, and titles the segments into a working draft. |
| **Read** | A full reading surface: pagination, highlight/quote annotations with colors and notes, bookmarks, per-book resume position, inline word definitions, and audio narration. |
| **Export** | `pdfkit` for a typeset PDF; `docx` for a styled Word document with real heading levels, lists, and inline formatting parsed from Markdown. |
| **Social** | A manga hub with a one-vote-per-user character leaderboard, and discussion threads that attach to either a book or a manga. |

---

## 🏛 System Architecture

A classic decoupled two-tier deployment: a static SPA on the edge, a stateful API on a
container host, MongoDB Atlas behind it.

```mermaid
graph TB
    subgraph Browser["🖥️ Browser — React 19 SPA"]
        R["react-router-dom 7"]
        AC["AuthContext<br/>token in localStorage"]
        TC["ThemeContext"]
        AX["axiosInstance<br/>Bearer interceptor"]
        ED["Editor<br/>@uiw/react-md-editor + dnd-kit"]
        VW["Reader<br/>ViewBook"]
        GS["GSAP ScrollTrigger"]
    end

    subgraph CDN["▲ Vercel — static + SPA rewrite"]
        DIST["dist/<br/>all paths → index.html"]
    end

    subgraph API["🟢 Express 5 API"]
        CORS["CORS allowlist<br/>+ *.vercel.app regex"]
        MW1["protect<br/>JWT verify"]
        MW2["premiumOnly<br/>tier + free-trial counter"]
        MW3["multer<br/>disk, 10MB, img/pdf"]
        RA["/api/auth"]
        RB["/api/books"]
        RAI["/api/ai"]
        RE["/api/export"]
        RS["/api/social"]
        STATIC["/uploads static"]
    end

    subgraph Data["🗄️ Persistence"]
        M[("MongoDB Atlas<br/>Users · Books · Characters · Discussions")]
        FS["Local disk<br/>uploads/"]
    end

    subgraph Ext["☁️ External APIs"]
        GEM["Google Gemini<br/>6-model fallback ladder"]
        SM["Smallest AI<br/>lightning-v3.1 TTS"]
        GB["Google Books API<br/>related + deals"]
        WEB["Arbitrary URLs<br/>ingestion scrape"]
    end

    R --> AX
    AC --> AX
    ED --> AX
    VW --> AX
    DIST -.serves.-> R

    AX -->|"Bearer JWT"| CORS
    CORS --> MW1
    MW1 --> RA & RB & RE & RS
    MW1 --> MW2 --> RAI
    RB --> MW3 --> FS
    STATIC --> FS

    RA & RB & RE & RS --> M
    RAI --> GEM
    RAI --> SM
    RB --> GB
    RB --> WEB

    classDef fe fill:#2D8EFF,stroke:#1b5fb3,color:#fff
    classDef be fill:#AD4733,stroke:#7a2f20,color:#fff
    classDef db fill:#47A248,stroke:#2f6b2f,color:#fff
    classDef ex fill:#0d5b5e,stroke:#093f41,color:#fff
    class R,AC,TC,AX,ED,VW,GS,DIST fe
    class CORS,MW1,MW2,MW3,RA,RB,RAI,RE,RS,STATIC be
    class M,FS db
    class GEM,SM,GB,WEB ex
```

### Request lifecycle

```mermaid
flowchart LR
    A["React page"] --> B["axiosInstance"]
    B --> C{"token in<br/>localStorage?"}
    C -->|yes| D["Authorization:<br/>Bearer …"]
    C -->|no| E["Anonymous"]
    D & E --> F["CORS check<br/>allowlist ∪ /^https://[a-z0-9-]+\.vercel\.app$/"]
    F -->|reject| G["CORS error"]
    F -->|allow| H["protect middleware"]
    H -->|"invalid"| I["401"]
    H -->|"valid"| J["req.user = User − password"]
    J --> K{"AI route?"}
    K -->|yes| L["premiumOnly"]
    K -->|no| N["Controller"]
    L -->|"tier=premium<br/>or free trial left"| N
    L -->|"quota spent"| M["403 upgrade"]
    N --> O["Mongoose / external API"]
    O --> P["JSON response"]
    P --> Q["Response interceptor:<br/>reject HTML masquerading as JSON"]
```

That last step is a real-world scar: a misconfigured `VITE_BASE_URL` in production makes the
SPA request itself, get `index.html` back with a `200 OK`, and fail deep inside a component.
The interceptor catches `content-type: text/html` and fails loudly instead.

---

## 🗄 Data Model

```mermaid
erDiagram
    USER ||--o{ BOOK : owns
    USER ||--o{ DISCUSSION : posts
    USER }o--o{ CHARACTER : "votes for"
    BOOK ||--o{ CHAPTER : contains
    BOOK ||--o{ ANNOTATION : "is marked up by"
    BOOK ||--o{ BOOKMARK : "is bookmarked at"
    BOOK ||--o{ DISCUSSION : "is discussed in"
    CHARACTER ||--o{ DISCUSSION : "is discussed in"

    USER {
        ObjectId _id PK
        string name
        string email UK "lowercased"
        string password "bcrypt, select:false"
        string avatar
        string pronouns
        string bio
        string occupation
        string location
        boolean isPro
        string tier "free | premium"
        number synthesizedBookCount "free-trial counter"
        date createdAt
    }
    BOOK {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string subtitle
        string author
        string coverImage
        string status "draft | published"
        number lastChapterIndex "resume position"
        number lastPageIndex "resume position"
        boolean isSynthesized "AI-generated?"
        date createdAt
    }
    CHAPTER {
        string title
        string description
        string content "Markdown"
    }
    ANNOTATION {
        ObjectId _id PK
        string type "highlight | quote"
        number chapterIndex
        number pageIndex
        string text
        string note
        string color "rgba"
        date createdAt
    }
    BOOKMARK {
        ObjectId _id PK
        number chapterIndex
        number pageIndex
        string label
        date createdAt
    }
    CHARACTER {
        ObjectId _id PK
        string name UK
        string mangaTitle
        string image
        number votes
        ObjectId[] votedBy FK "one vote per user"
    }
    DISCUSSION {
        ObjectId _id PK
        string targetId "indexed — Book id or manga slug"
        string targetType "book | manga"
        ObjectId user FK
        string content "max 1000"
        date createdAt
    }
```

**Design note — everything is embedded.** Chapters, annotations, and bookmarks are
subdocuments on `Book`, not separate collections. One `findById` hydrates an entire reading
session: no joins, no `$lookup`, no N+1. The cost is a 16 MB BSON document ceiling and
whole-document rewrites on every save — see
[Scaling Playbook](#phase-1--fix-what-hurts-first) for when that flips from asset to liability.

**Design note — polymorphic discussions.** `Discussion.targetId` is a plain `String`, so the
same collection serves book threads (`ObjectId` as string) and manga threads (a slug).
`targetType` disambiguates, and `targetId` carries the index.

---

## 🔌 API Reference

Base: `http://localhost:5000` · All 🔒 routes need `Authorization: Bearer <jwt>`.

### `/api/auth`

| Method | Path | Auth | Description |
| --- | --- | :---: | --- |
| `POST` | `/register` | — | Create account, returns JWT |
| `POST` | `/login` | — | Returns JWT |
| `GET` | `/profile` | 🔒 | Current user |
| `PUT` | `/profile` | 🔒 | Update bio, pronouns, avatar, occupation, location |

### `/api/books`

| Method | Path | Auth | Description |
| --- | --- | :---: | --- |
| `POST` | `/` | 🔒 | Create a book |
| `GET` | `/` | 🔒 | List the caller's books |
| `GET` | `/:id` | 🔒 | Full book with chapters, annotations, bookmarks |
| `PUT` | `/:id` | 🔒 | Update metadata + chapters |
| `DELETE` | `/:id` | 🔒 | Delete |
| `PUT` | `/cover/:id` | 🔒 | Upload cover (`multipart`, field `coverImage`) |
| `POST` | `/upload-pdf` | 🔒 | PDF → chaptered draft (`multipart`, field `pdf`) |
| `POST` | `/ingest-url` | 🔒 | URL → chaptered draft |
| `PATCH` | `/progress/:id` | 🔒 | Save `lastChapterIndex` / `lastPageIndex` |
| `POST` | `/annotations/:id` | 🔒 | Add highlight or quote |
| `DELETE` | `/annotations/:id/:annotationId` | 🔒 | Remove annotation |
| `POST` | `/bookmarks/:id` | 🔒 | Add bookmark |
| `DELETE` | `/bookmarks/:id/:bookmarkId` | 🔒 | Remove bookmark |
| `GET` | `/related/:id` | 🔒 | Google Books lookups by title |
| `GET` | `/deals/:id` | 🔒 | Purchase links + prices, top 3 |

### `/api/ai` — all 🔒, outline & chapter also 💎 premium-gated

| Method | Path | Gate | Description |
| --- | --- | :---: | --- |
| `POST` | `/generate-outline` | 💎 | `{topic, style, numChapters, description}` → chapter array |
| `POST` | `/generate-chapter-content` | 💎 | Draft one chapter's prose |
| `POST` | `/define` | 🔒 | Definition for a tapped word, in context |
| `POST` | `/continue` | 🔒 | "Continue this story" from current text |
| `POST` | `/speak` | 🔒 | `{text, voiceId, voiceType}` → `audio/mpeg` |
| `POST` | `/get-chunks` | 🔒 | Split text into ~300-word chunks for streaming TTS |

### `/api/export` & `/api/social`

| Method | Path | Auth | Description |
| --- | --- | :---: | --- |
| `GET` | `/api/export/:id/pdf` | 🔒 | Typeset PDF via `pdfkit` |
| `GET` | `/api/export/:id/doc` | 🔒 | Styled DOCX via `docx` |
| `GET` | `/api/social/leaderboard` | — | Top 20 characters by votes |
| `POST` | `/api/social/vote/:id` | 🔒 | One vote per user, enforced by `votedBy` |
| `GET` | `/api/social/discuss/:targetId` | — | Thread for a book or manga |
| `POST` | `/api/social/discuss` | 🔒 | Post to a thread |

---

## 🔀 Key Flows

### 1. Book Synthesis: prompt → finished draft

```mermaid
sequenceDiagram
    autonumber
    participant U as Author
    participant M as CreateBookModel
    participant API as Express API
    participant PM as premiumOnly
    participant G as Gemini
    participant DB as MongoDB

    U->>M: topic, style, chapter count, description
    M->>API: POST /api/ai/generate-outline
    API->>PM: tier? synthesizedBookCount?
    alt free tier, count ≥ 1
        PM-->>M: 403 — upgrade required
    else allowed
        PM->>G: outline prompt<br/>"return ONLY a valid JSON array"
        G-->>API: [{title, description} × N]
        API-->>M: outline
        M->>API: POST /api/books  { title, author, chapters }
        API->>DB: insert Book { isSynthesized: true, status: "draft" }
        DB-->>M: book._id
        M->>U: redirect → /editor/:bookId

        loop per chapter
            U->>API: POST /api/ai/generate-chapter-content
            API->>G: chapter prompt + book context
            G-->>API: Markdown prose
            API-->>U: rendered into the editor
            U->>API: PUT /api/books/:id  (autosave)
            API->>DB: update chapters[]
        end
    end
```

### 2. The Model Fallback Ladder

Gemini model availability varies by API key, region, and API version — a hard-coded model id
is a guaranteed future 404. `getRobustModel` walks a ladder until something answers, and if
everything 404s it introspects the account and logs what *is* available.

```mermaid
flowchart TD
    START([generateContent]) --> A["gemini-2.0-flash · v1beta"]
    A -->|ok| WIN([Return result])
    A -->|fail| B["gemini-2.5-flash · v1beta"]
    B -->|ok| WIN
    B -->|fail| C["gemini-1.5-flash · v1"]
    C -->|ok| WIN
    C -->|fail| D["gemini-1.5-flash · v1beta"]
    D -->|ok| WIN
    D -->|fail| E["gemini-pro · v1"]
    E -->|ok| WIN
    E -->|fail| F["gemini-flash-latest · v1beta"]
    F -->|ok| WIN
    F -->|fail| DIAG["Self-diagnostic:<br/>GET /models?key=… → log what exists"]
    DIAG --> THROW([Throw lastError])

    classDef ok fill:#47A248,stroke:#2f6b2f,color:#fff
    classDef bad fill:#ED1C24,stroke:#9c1218,color:#fff
    class WIN ok
    class THROW,DIAG bad
```

The same self-diagnostic runs once at server boot and prints every model the key can reach —
so a deployment that will fail at request time announces it in the startup log instead.

### 3. PDF & URL Ingestion

Two doors into the same destination: an unstructured blob becomes a chaptered `Book`.

```mermaid
flowchart TB
    subgraph PDF["📄 POST /books/upload-pdf"]
        P1["multer → uploads/<br/>10 MB cap, pdf|jpg|png|gif"] --> P2["pdf-parse extract"]
        P2 --> P3{"text.length ≥ 10?"}
        P3 -->|no| P4["500 — scanned or encrypted"]
        P3 -->|yes| P5["Chunk @ 5 000 chars"]
        P5 --> P6["Title: 'Section 01', 'Section 02'…<br/>cap at 50 chapters"]
        P6 --> P7["Title from filename, uppercased"]
        P7 --> SAVE
        SAVE --> P8["fs.unlinkSync — delete temp file"]
    end

    subgraph URL["🔗 POST /books/ingest-url"]
        U1["axios.get(url)"] --> U2["Regex &lt;title&gt;"]
        U2 --> U3["Collect &lt;p&gt; blocks &gt; 50 chars"]
        U3 --> U4{"any content?"}
        U4 -->|no| U5["Fallback: strip &lt;body&gt;,<br/>first 10 000 chars"]
        U4 -->|yes| U6["Chunk @ 2 000 words"]
        U5 --> U6
        U6 --> U7["Title: 'Segment 1', 'Segment 2'…"]
        U7 --> SAVE
    end

    SAVE[("Book { chapters[], status: 'draft' }")]
    SAVE --> EDIT(["/editor/:bookId"])

    classDef err fill:#ED1C24,stroke:#9c1218,color:#fff
    class P4 err
```

> ⚠️ `cheerio` is a declared dependency but the URL path currently runs on regex fallbacks —
> it was disabled to stop a crash and never re-enabled. Re-enabling it is a two-line change
> and materially improves extraction quality. See [Roadmap](#-roadmap).

### 4. The Reader: annotations, bookmarks, TTS

```mermaid
sequenceDiagram
    autonumber
    participant U as Reader
    participant V as ViewBookPage
    participant API as API
    participant DB as MongoDB
    participant TTS as Smallest AI

    U->>V: Open /view-book/:bookId
    V->>API: GET /api/books/:id
    API->>DB: findById — chapters + annotations + bookmarks in ONE doc
    DB-->>V: full book
    V->>V: Jump to lastChapterIndex / lastPageIndex

    par Reading
        U->>V: Select text → highlight
        V->>API: POST /api/books/annotations/:id<br/>{ type, chapterIndex, pageIndex, text, note, color }
        API->>DB: $push annotations
    and Page turns
        V->>API: PATCH /api/books/progress/:id (debounced)
        API->>DB: update lastChapterIndex/lastPageIndex
    and Word lookup
        U->>V: Tap a word
        V->>API: POST /api/ai/define
        API-->>V: definition popover
    end

    U->>V: ▶ Listen
    V->>API: POST /api/ai/get-chunks { text, size: 300 }
    API-->>V: chunks[]
    loop each chunk
        V->>API: POST /api/ai/speak { text, voiceType }
        API->>TTS: lightning-v3.1, voice magnus|kavya, mp3
        alt success
            TTS-->>V: audio/mpeg buffer → play
        else key missing or upstream error
            API-->>V: { needsFallback: true }
            V->>V: Browser SpeechSynthesis API
        end
    end
```

Chunking before synthesis is what makes narration feel instant: playback of chunk *n* starts
while chunk *n+1* is still being generated, and `needsFallback` means a missing API key
degrades to the browser's built-in voice rather than a broken button.

### 5. Export Pipeline

```mermaid
flowchart LR
    A["GET /api/export/:id/{pdf,doc}"] --> B["Book.findById"]
    B --> C["markdown-it parse<br/>→ token stream"]
    C --> D{Format}

    D -->|doc| E["processMarkdownToDocx"]
    E --> E1["Headings h1–h6 → HeadingLevel"]
    E --> E2["Paragraphs → TextRun[]"]
    E --> E3["Ordered / bullet lists"]
    E --> E4["Inline: bold · italic · code"]
    E1 & E2 & E3 & E4 --> E5["Cover page section"]
    E5 --> E6["Packer.toBuffer → .docx"]

    D -->|pdf| F["pdfkit document"]
    F --> F1["Cover + title page"]
    F --> F2["Chapter breaks"]
    F --> F3["Typeset body"]
    F1 & F2 & F3 --> F4["Stream → .pdf"]

    E6 & F4 --> G["Content-Disposition: attachment"]
```

The DOCX path is a real Markdown→OOXML translator, not a `<p>`-dump: it walks
`markdown-it`'s token stream and emits proper `Paragraph` / `TextRun` / `HeadingLevel`
structures, so the exported file has a working navigation pane and real styles.

### 6. Freemium Gating

`premiumOnly` is deliberately generous — the free tier lets you finish one entire book, not
just start one.

```mermaid
flowchart TD
    REQ([POST /api/ai/generate-*]) --> P{"user.tier === 'premium'?"}
    P -->|yes| PASS([✅ Allow])
    P -->|no| C["count = user.synthesizedBookCount ?? 0"]
    C --> ROUTE{Which route?}
    ROUTE -->|generate-outline| O{"count < 1?"}
    ROUTE -->|generate-chapter-content| CH{"count ≤ 1?"}
    O -->|yes| PASS
    O -->|no| DENY
    CH -->|yes| PASS
    CH -->|no| DENY([⛔ 403 — upgrade])

    classDef ok fill:#47A248,stroke:#2f6b2f,color:#fff
    classDef no fill:#ED1C24,stroke:#9c1218,color:#fff
    class PASS ok
    class DENY no
```

The asymmetry (`< 1` for outlines, `≤ 1` for chapters) is intentional: you get **one** free
outline, but you can keep drafting chapters for that book after the counter increments.

### 7. Manga Hub & Social

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant M as MangaPage
    participant API as API
    participant DB as MongoDB

    M->>API: GET /api/social/leaderboard
    alt DB seeded
        API->>DB: Character.find().sort(votes:-1).limit(20)
        DB-->>M: characters
    else empty or offline
        M->>M: Render FALLBACK_CHARACTERS<br/>(13 bundled, with local images)
    end

    U->>M: Vote for a character
    M->>API: POST /api/social/vote/:id
    API->>API: isValidObjectId? — rejects fallback ids like "f1"
    alt invalid id
        API-->>M: 404 "currently in preview mode"
    else already in votedBy
        API-->>M: 400 "already voted"
    else
        API->>DB: votes += 1 and votedBy.push(userId)
        DB-->>M: updated character
    end

    U->>M: Open a thread
    M->>API: GET /api/social/discuss/:targetId
    API->>DB: Discussion.find({ targetId }).populate(user)
    DB-->>M: thread
```

The fallback roster means the manga page is never blank — an unseeded database still renders
a full leaderboard, and the `ObjectId` guard stops the synthetic ids from causing Mongoose
cast errors when someone tries to vote.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **MongoDB** — Atlas or local
- A **Google Gemini** API key
- A **Smallest AI** API key (optional — TTS falls back to the browser)

### 1 · Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in the values below
npm run dev                 # nodemon → http://localhost:5000
```

Watch the boot log — the startup diagnostic prints every Gemini model your key can reach:

```
--- STARTUP AI DIAGNOSTIC ---
Models identified: gemini-2.0-flash, gemini-1.5-flash, ...
-----------------------------
```

Seed the manga leaderboard (optional):

```bash
node seedCharacters.js
```

### 2 · Frontend

```bash
cd frontend/BookForge
npm install
cp .env.example .env        # VITE_BASE_URL=http://localhost:5000
npm run dev                 # → http://localhost:5173
```

### 3 · Verify

```bash
curl http://localhost:5000        # → "BookForge API is running 🚀"
```

### Deployment

| Piece | Host | Notes |
| --- | --- | --- |
| Frontend | **Vercel** | `vercel.json` rewrites every path to `/index.html` for client-side routing. Set `VITE_BASE_URL` to the API origin — **not** a `/api` suffix (the axios instance strips it, but be explicit). |
| Backend | Any Node host | Needs a persistent filesystem for `uploads/`, or swap to object storage first. |
| Database | MongoDB Atlas | |

CORS accepts the `CORS_ORIGINS` allowlist **plus** any `https://<name>.vercel.app`, so
preview deployments work without a config change.

### Backend diagnostic scripts

The repo ships a set of standalone probes, useful when a key or model misbehaves:

| Script | Purpose |
| --- | --- |
| `test-db.js` | MongoDB connectivity |
| `test-ai.js` · `verify-ai.js` | Gemini reachability |
| `check_models.js` · `discover_models.js` · `list-models.js` | Enumerate available models |
| `test-elevenlabs.js` · `check-api.js` | TTS provider probes |
| `final_diagnostic.js` | Full-stack smoke check |
| `seedCharacters.js` · `sync_characters.js` | Manga leaderboard data |
| `mock-server.js` | Frontend dev without the real backend |

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Required | Purpose |
| --- | :---: | --- |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Signs and verifies auth tokens |
| `GEMINI_API_KEY` | ✅ | All AI generation |
| `PORT` | ⬜ | Defaults to `5000` |
| `CORS_ORIGINS` | ⬜ | Comma-separated allowlist; `*.vercel.app` always permitted |
| `SMALLEST_AI_API_KEY` | ⬜ | TTS narration — without it, `needsFallback` → browser voice |
| `ELEVEN_LABS_API_KEY` | ⬜ | Only used by the legacy diagnostic scripts |

> ⚠️ `.env.example` lists `ELEVENLABS_API_KEY`, but the code reads `ELEVEN_LABS_API_KEY`
> (with the underscore) — and the live TTS path uses `SMALLEST_AI_API_KEY`, which the example
> file omits entirely. Use the table above as the source of truth.

### `frontend/BookForge/.env`

| Variable | Required | Purpose |
| --- | :---: | --- |
| `VITE_BASE_URL` | ✅ in prod | API origin. Dev falls back to `http://localhost:8000`; production with this unset logs a loud deployment error. |
| `VITE_API_URL` | ⬜ | Legacy, kept for reference |

---

## 📁 Project Structure

```
BookForge/
├── backend/
│   ├── server.js                 # Express bootstrap, CORS, route mounting
│   ├── config/db.js              # Mongoose connection
│   ├── models/
│   │   ├── Book.js               # + embedded chapter/annotation/bookmark schemas
│   │   ├── User.js               # bcrypt pre-save hook, matchPassword method
│   │   ├── Character.js          # manga leaderboard
│   │   └── Discussion.js         # polymorphic threads
│   ├── controller/
│   │   ├── aiController.js       # getRobustModel ladder, outline, chapter, define,
│   │   │                         #   continue, speak, get-chunks
│   │   ├── bookController.js     # CRUD, PDF ingest, progress, annotations,
│   │   │                         #   bookmarks, related, deals
│   │   ├── ingestController.js   # URL → chapters
│   │   ├── exportController.js   # markdown-it → docx / pdfkit
│   │   ├── authController.js
│   │   └── socialController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js     # protect + premiumOnly
│   │   └── uploadMiddleware.js   # multer, 10 MB, img|pdf
│   ├── routes/                   # auth · books · ai · export · social
│   ├── uploads/                  # ⚠️ ephemeral on most PaaS hosts
│   └── *.js                      # diagnostic scripts (see table above)
│
└── frontend/BookForge/
    ├── src/
    │   ├── App.jsx               # routes; /view-book renders outside the chrome
    │   ├── context/              # AuthContext · ThemeContext
    │   ├── utils/
    │   │   ├── axiosInstance.js  # Bearer interceptor + HTML-response guard
    │   │   └── apiPaths.js       # every endpoint, one place
    │   ├── pages/                # Landing · Login · Signup · Dashboard · Editor
    │   │                         # ViewBook · Profile · Pricing · Explore
    │   │                         # BookDetails · Manga · Discussion
    │   ├── components/
    │   │   ├── editor/           # BookDetailsTab · ChapterEditorTab
    │   │   │                     # ChapterSidebar · SimpleMDEditor
    │   │   ├── view/             # ViewBook · ViewChapterSidebar
    │   │   ├── models/           # CreateBookModel · PdfUploadModal
    │   │   ├── layout/ · landing/ · cards/ · dashboard/ · auth/ · ui/
    │   └── data/                 # mangaData, static content
    └── vercel.json               # SPA rewrite
```

---

## 📈 Scaling Playbook

```mermaid
graph TB
    subgraph Now["Today — single instance"]
        N1["Vercel SPA"] --> N2["1× Express"]
        N2 --> N3[("Mongo Atlas")]
        N2 --> N4["Local uploads/"]
        N2 --> N5["Sync Gemini calls"]
    end

    subgraph Next["Next — ~50k books"]
        X1["CDN"] --> X2["Express × N<br/>behind a load balancer"]
        X2 --> X3[("Atlas + read replicas")]
        X2 --> X4["S3 / R2 + CDN"]
        X2 --> X5["BullMQ queue"] --> X6["AI + export workers"]
        X2 --> X7["Redis<br/>sessions · cache · rate limits"]
    end

    subgraph Later["Later — millions"]
        Y1["Edge CDN"] --> Y2["API gateway"]
        Y2 --> Y3["auth-svc"]
        Y2 --> Y4["book-svc"]
        Y2 --> Y5["ai-svc"]
        Y2 --> Y6["export-svc"]
        Y2 --> Y7["social-svc"]
        Y4 --> Y8[("Sharded Mongo<br/>shard key: userId")]
        Y5 --> Y9["Model router<br/>+ semantic cache"]
        Y6 --> Y10["Render farm"]
    end

    Now --> Next --> Later

    classDef a fill:#AD4733,stroke:#7a2f20,color:#fff
    classDef b fill:#2D8EFF,stroke:#1b5fb3,color:#fff
    classDef c fill:#47A248,stroke:#2f6b2f,color:#fff
    class N1,N2,N3,N4,N5 a
    class X1,X2,X3,X4,X5,X6,X7 b
    class Y1,Y2,Y3,Y4,Y5,Y6,Y7,Y8,Y9,Y10 c
```

### Phase 1 — fix what hurts first

| # | Problem | Why it bites | Fix |
| --- | --- | --- | --- |
| 1 | **`uploads/` is on local disk** | Render/Railway/Heroku filesystems are ephemeral — every deploy silently deletes every cover image. Also blocks horizontal scaling: instance B can't serve a file instance A wrote. | Move covers to **S3 / Cloudinary / R2**. Store the URL, not the path. Highest-priority change in the repo. |
| 2 | **Books are one giant document** | `chapters`, `annotations`, and `bookmarks` all embed. A 50-chapter book with hundreds of highlights approaches Mongo's 16 MB ceiling, and *every* autosave rewrites the whole document. | Split `chapters` into its own collection keyed by `bookId` + `order`; keep annotations embedded (they're small and always read with the book). Add `PATCH /books/:id/chapters/:idx` so autosave writes one chapter, not the book. |
| 3 | **AI calls block the request** | Chapter generation can run 30–60 s. Each one pins a Node worker; a handful of concurrent authors saturates the event loop's practical concurrency. | Queue with **BullMQ + Redis**, return a job id, stream tokens over SSE. |
| 4 | **No rate limiting anywhere** | A single script can burn the entire Gemini quota. `premiumOnly` gates *entitlement*, not *rate*. | `express-rate-limit` + Redis store, tiered by `user.tier`. |
| 5 | **`GET /books` returns everything** | No pagination, no projection — the dashboard downloads full chapter text for every book to render cards. | `.select('title author coverImage status updatedAt')` + cursor pagination. |
| 6 | **`ingest-url` is an SSRF vector** | `axios.get(userSuppliedUrl)` from inside your network reaches `169.254.169.254`, `localhost`, and private ranges. | Allowlist schemes, resolve DNS and reject private/link-local IPs, cap redirects, set a timeout and a response-size limit. |
| 7 | **JWT in `localStorage`** | Any XSS exfiltrates a long-lived token. | Move to `httpOnly` + `Secure` + `SameSite` cookies with a short-lived access token and a refresh rotation. |
| 8 | **Google Books called per request** | `/related` and `/deals` hit the API on every page view and count against a shared quota. | Cache by book title in Redis, TTL 24 h. Hit rate will be very high. |

### Phase 2 — architecture

```mermaid
flowchart TB
    subgraph Read["Read path"]
        A["GET /books/:id"] --> B{"Redis hit?"}
        B -->|yes| C["Return cached"]
        B -->|no| D["Mongo read replica"] --> E["Cache, TTL 5 min"] --> C
    end
    subgraph Write["Write path"]
        F["Chapter autosave"] --> G["Debounce 2s client-side"]
        G --> H["PATCH single chapter"]
        H --> I["Primary"] --> J["Invalidate cache key"]
    end
    subgraph AIpath["AI path"]
        K["Generate request"] --> L{"Semantic cache?"}
        L -->|hit| M["Return cached"]
        L -->|miss| N["Enqueue"] --> O["Worker pool"] --> P["Model router:<br/>flash → pro on failure"]
        P --> Q["SSE stream to client"]
    end
```

- **Shard by `userId`.** Every hot query is already user-scoped (`Book.find({userId})`), so
  `userId` is a natural, low-skew shard key with no query-pattern rewrites needed.
- **Separate the export service.** PDF/DOCX rendering is CPU-bound and bursty — exactly the
  workload you don't want sharing an event loop with chat-speed CRUD. Split it out and scale
  it independently.
- **Semantic cache for AI.** Outline requests cluster hard around popular topics. Embed the
  `{topic, style, numChapters}` tuple, cache by nearest neighbour above a similarity
  threshold — a large share of free-tier generations become free.
- **Full-text search.** `/explore` will need Atlas Search once the catalogue passes a few
  thousand books; a regex scan over `title` won't hold.
- **Frontend splitting.** GSAP + the Markdown editor + the reader are all eagerly bundled.
  `React.lazy` the editor and reader routes — most sessions touch one, not both.

### Cost levers, cheapest first

1. Cache Google Books responses (free quota, high repeat rate).
2. Route `define` and `continue` to the cheapest Flash model; reserve larger models for
   chapter drafting.
3. Serve covers as CDN derivatives, not originals.
4. Cache TTS audio by `hash(text + voiceId)` — re-listening a chapter should cost nothing.

---

## 🗺 Roadmap

- [ ] Move `uploads/` to object storage — unblocks horizontal scaling and stops deploys eating covers
- [ ] Re-enable `cheerio` in `ingestController` and delete the regex fallbacks
- [ ] SSRF hardening on `/books/ingest-url`
- [ ] Split `chapters` into its own collection; per-chapter autosave endpoint
- [ ] Queue + stream AI generation instead of blocking the request
- [ ] Rate limiting on every AI route
- [ ] Pagination and projection on `GET /books`
- [ ] `httpOnly` cookie auth with refresh rotation
- [ ] Reconcile `.env.example` with the variables the code actually reads
- [ ] Real payment integration behind `tier: 'premium'`
- [ ] Test suite — there is none today

---

<div align="center">

**Forge a book out of an idea.**

[Report a bug](https://github.com/satyansh911/BookForge/issues) · [Request a feature](https://github.com/satyansh911/BookForge/issues)

</div>
