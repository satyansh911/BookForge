/**
 * End-to-end API smoke test.
 *
 * Boots an in-memory MongoDB, mounts the real Express app, and drives every
 * user-facing workflow the frontend performs. AI and third-party HTTP calls
 * are stubbed so the run is deterministic and needs no API keys.
 *
 *   node scripts/e2e.js
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-test-secret";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "e2e-fake-key";
process.env.NODE_ENV = "test";

const path = require("path");
const fs = require("fs");
const Module = require("module");

// ---------------------------------------------------------------- stubbing --
// Intercept require() so the AI SDK and axios never make real network calls.
const realResolve = Module._resolveFilename;
const stubs = {};

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (stubs[request]) return stubs[request];
  return origLoad.apply(this, arguments);
};

stubs["@google/generative-ai"] = {
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async (prompt) => ({
          response: {
            text: () => {
              if (String(prompt).includes("book outline generator")) {
                return JSON.stringify([
                  { title: "Chapter 1: Origins", description: "Where it began." },
                  { title: "Chapter 2: Conflict", description: "Where it turns." },
                ]);
              }
              if (String(prompt).includes("dictionary")) {
                return "noun — a stubbed definition. Example: this is a stub.";
              }
              return "Stubbed generated prose for the e2e run.";
            },
          },
        }),
      };
    }
  },
};

const realAxios = require("axios");
stubs["axios"] = Object.assign(
  function stubAxios() {
    return Promise.resolve({ status: 200, data: {} });
  },
  {
    get: async (url) => {
      if (url.includes("googleapis.com/books")) {
        // Simulate Google Books' anonymous rate limit for one specific title.
        if (url.includes("RATELIMIT")) {
          const err = new Error("Request failed with status code 429");
          err.response = { status: 429, data: { error: {} } };
          throw err;
        }
        return {
          data: {
            items: [
              {
                id: "gb1",
                volumeInfo: {
                  title: "The Silent Archive",
                  authors: ["A. Writer"],
                  publisher: "Test House",
                  imageLinks: { thumbnail: "http://example.com/t.jpg" },
                  previewLink: "http://example.com/p",
                },
                saleInfo: {
                  buyLink: "http://example.com/buy",
                  listPrice: { amount: 9.99, currencyCode: "USD" },
                  isEbook: true,
                },
              },
            ],
          },
        };
      }
      if (url.includes("generativelanguage")) {
        return { data: { models: [{ name: "models/gemini-2.0-flash" }] } };
      }
      // ingest-url target
      return {
        data:
          "<html><head><title>Ingested Test Page</title></head><body>" +
          "<p>" + "word ".repeat(400) + "</p>" +
          "<p>" + "other ".repeat(400) + "</p>" +
          "</body></html>",
      };
    },
    post: async () => ({ status: 200, data: Buffer.from("fake-audio") }),
  }
);

// ------------------------------------------------------------------ harness --
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");

let pass = 0;
let fail = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? `\n      ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

// A minimal but fully valid, text-bearing PDF, hand-built with correct xref
// byte offsets so the fixture exercises the extractor rather than a generator.
function makePdf() {
  const lines = [];
  for (let i = 0; i < 12; i++) {
    lines.push(`(Section ${i + 1}. BookForge ingestion probe text for the end to end suite.) Tj`);
    lines.push("0 -18 Td");
  }
  const content = `BT\n/F1 12 Tf\n56 720 Td\n14 TL\n${lines.join("\n")}\nET`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  let body = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body, "latin1"));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const startxref = Buffer.byteLength(body, "latin1");
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (body += `${String(o).padStart(10, "0")} 00000 n \n`));
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(body, "latin1");
}

// Pull one deflated entry out of a zip container (a .docx) without adding a
// zip dependency just for the test.
function extractZipEntry(buf, name) {
  const target = Buffer.from(name, "utf8");
  let offset = 0;
  while ((offset = buf.indexOf("PK\x03\x04", offset, "latin1")) !== -1) {
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const entryName = buf.slice(nameStart, nameStart + nameLen);
    const dataStart = nameStart + nameLen + extraLen;
    let compSize = buf.readUInt32LE(offset + 18);
    if (entryName.equals(target)) {
      if (compSize === 0) {
        // Streamed entry: size lives in the trailing data descriptor, so read
        // up to the next local file header instead.
        const next = buf.indexOf("PK\x03\x04", dataStart, "latin1");
        const end = next === -1 ? buf.indexOf("PK\x01\x02", dataStart, "latin1") : next;
        compSize = (end === -1 ? buf.length : end) - dataStart - 16;
      }
      return buf.slice(dataStart, dataStart + compSize);
    }
    offset = dataStart + (compSize || 1);
  }
  throw new Error(`zip entry not found: ${name}`);
}

// supertest has no parser for the DOCX mime type and hands back an empty body;
// force everything binary so we can assert on real bytes.
function binaryParser(res, callback) {
  const chunks = [];
  res.on("data", (c) => chunks.push(Buffer.from(c)));
  res.on("end", () => callback(null, Buffer.concat(chunks)));
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  const app = require("../app");
  const api = request(app);
  const Character = require("../models/Character");

  let token = "";
  let userId = "";
  let bookId = "";
  let annotationId = "";
  let bookmarkId = "";
  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ------------------------------------------------------------------ auth --
  section("Auth");
  {
    let r = await api.get("/api/health");
    check("GET /api/health returns ok", r.status === 200 && r.body.status === "ok", `got ${r.status}`);

    r = await api.post("/api/auth/register").send({ name: "Ada", email: "ada@test.dev", password: "secret123" });
    check("register creates a user + token", r.status === 201 && !!r.body.token, `got ${r.status} ${JSON.stringify(r.body)}`);
    token = r.body.token;
    userId = r.body._id;

    r = await api.post("/api/auth/register").send({ name: "Ada", email: "ada@test.dev", password: "secret123" });
    check("duplicate register rejected", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/auth/register").send({ email: "x@y.z" });
    check("register without name/password rejected", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/auth/login").send({ email: "ada@test.dev", password: "wrongpass" });
    check("login with bad password rejected", r.status === 401, `got ${r.status}`);

    r = await api.post("/api/auth/login").send({ email: "ada@test.dev", password: "secret123" });
    check("login returns token", r.status === 200 && !!r.body.token, `got ${r.status} ${JSON.stringify(r.body)}`);
    token = r.body.token;

    r = await api.get("/api/auth/profile");
    check("profile without token → 401", r.status === 401, `got ${r.status}`);

    r = await api.get("/api/auth/profile").set(auth());
    check("profile with token → user", r.status === 200 && r.body.email === "ada@test.dev", `got ${r.status} ${JSON.stringify(r.body)}`);

    r = await api.put("/api/auth/profile").set(auth()).send({ bio: "Writes things.", location: "Earth" });
    check("profile update persists", r.status === 200 && r.body.bio === "Writes things.", `got ${r.status} ${JSON.stringify(r.body)}`);

    r = await api.get("/api/auth/profile").set({ Authorization: "Bearer not-a-real-token" });
    check("garbage token → 401", r.status === 401, `got ${r.status}`);
  }

  // ----------------------------------------------------------------- books --
  section("Books CRUD");
  {
    let r = await api.post("/api/books").set(auth()).send({ title: "", author: "" });
    check("create without title/author rejected", r.status === 400, `got ${r.status}`);

    r = await api
      .post("/api/books")
      .set(auth())
      .send({
        title: "The Silent Archive",
        author: "Ada",
        subtitle: "A test volume",
        chapters: [{ title: "Chapter 1: Origins", description: "Where it began.", content: "# Origins\n\nSome **prose**." }],
      });
    check("create book", r.status === 201 && !!r.body._id, `got ${r.status} ${JSON.stringify(r.body)}`);
    bookId = r.body._id;

    r = await api.get("/api/books").set(auth());
    check("list books returns the new book", r.status === 200 && r.body.length === 1, `got ${r.status} len=${r.body.length}`);

    r = await api.get(`/api/books/${bookId}`).set(auth());
    check("get book by id", r.status === 200 && r.body.title === "The Silent Archive", `got ${r.status}`);

    r = await api.get("/api/books/64b7f9f9f9f9f9f9f9f9f9f9").set(auth());
    check("get missing book → 404", r.status === 404, `got ${r.status}`);

    r = await api.get("/api/books/not-an-objectid").set(auth());
    check("get malformed id → 400/404 not 500", r.status === 400 || r.status === 404, `got ${r.status}`);

    r = await api
      .put(`/api/books/${bookId}`)
      .set(auth())
      .send({ title: "The Silent Archive", chapters: [{ title: "Chapter 1: Origins", content: "# Origins\n\nEdited **prose** with a [link](http://x.dev).\n\n- one\n- two" }] });
    check("update book chapters", r.status === 200 && r.body.chapters[0].content.includes("Edited"), `got ${r.status}`);

    // Ownership isolation
    const other = await api.post("/api/auth/register").send({ name: "Eve", email: "eve@test.dev", password: "secret123" });
    const eve = { Authorization: `Bearer ${other.body.token}` };
    r = await api.get(`/api/books/${bookId}`).set(eve);
    check("other user cannot read the book", r.status === 401, `got ${r.status}`);
    r = await api.put(`/api/books/${bookId}`).set(eve).send({ title: "Stolen" });
    check("other user cannot update the book", r.status === 401, `got ${r.status}`);
    r = await api.delete(`/api/books/${bookId}`).set(eve);
    check("other user cannot delete the book", r.status === 401, `got ${r.status}`);
    r = await api.get("/api/books").set(eve);
    check("other user's library is empty", r.status === 200 && r.body.length === 0, `got len=${r.body.length}`);
  }

  // -------------------------------------------------------------- progress --
  section("Reader: progress, annotations, bookmarks");
  {
    let r = await api.patch(`/api/books/progress/${bookId}`).set(auth()).send({ lastChapterIndex: 0, lastPageIndex: 3 });
    check("save reading progress", r.status === 200 && r.body.lastPageIndex === 3, `got ${r.status}`);

    r = await api
      .post(`/api/books/annotations/${bookId}`)
      .set(auth())
      .send({ type: "highlight", chapterIndex: 0, pageIndex: 1, text: "Some prose", note: "why this matters" });
    check("add annotation", r.status === 201 && !!r.body._id, `got ${r.status} ${JSON.stringify(r.body)}`);
    annotationId = r.body._id;

    r = await api.post(`/api/books/annotations/${bookId}`).set(auth()).send({ type: "invalid-type", chapterIndex: 0, text: "x" });
    check("annotation with bad enum rejected", r.status >= 400 && r.status < 500, `got ${r.status}`);

    r = await api.get(`/api/books/${bookId}`).set(auth());
    check("annotation is persisted on the book", r.body.annotations?.length === 1, `len=${r.body.annotations?.length}`);

    r = await api.post(`/api/books/bookmarks/${bookId}`).set(auth()).send({ chapterIndex: 0, pageIndex: 2, label: "Good bit" });
    check("add bookmark", r.status === 201 && !!r.body._id, `got ${r.status}`);
    bookmarkId = r.body._id;

    r = await api.delete(`/api/books/bookmarks/${bookId}/${bookmarkId}`).set(auth());
    check("delete bookmark", r.status === 200, `got ${r.status}`);

    r = await api.delete(`/api/books/annotations/${bookId}/${annotationId}`).set(auth());
    check("delete annotation", r.status === 200, `got ${r.status}`);

    r = await api.get(`/api/books/${bookId}`).set(auth());
    check("book has no annotations/bookmarks left", r.body.annotations.length === 0 && r.body.bookmarks.length === 0);
  }

  // -------------------------------------------------------------- ingestion --
  section("Ingestion");
  {
    let r = await api
      .post("/api/books/upload-pdf")
      .set(auth())
      .attach("pdf", makePdf(), "my-monograph-1700000000.pdf");
    check("PDF upload creates a chaptered book", r.status === 201 && r.body.chapters?.length > 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);

    r = await api.post("/api/books/upload-pdf").set(auth());
    check("PDF upload without file → 400", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/books/ingest-url").set(auth()).send({ url: "http://example.com/article" });
    check("URL ingest creates a chaptered book", r.status === 201 && r.body.chapters?.length > 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);

    r = await api.post("/api/books/ingest-url").set(auth()).send({});
    check("URL ingest without url → 400", r.status === 400, `got ${r.status}`);

    // Temp upload files must be cleaned up
    const uploadDir = path.join(__dirname, "..", "uploads");
    const leftovers = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).filter((f) => f.endsWith(".pdf")) : [];
    check("PDF temp file cleaned up", leftovers.length === 0, `leftover: ${leftovers.join(", ")}`);
  }

  // --------------------------------------------------------------- ai routes --
  section("AI routes");
  {
    let r = await api.post("/api/ai/generate-outline").send({ topic: "x" });
    check("outline without token → 401", r.status === 401, `got ${r.status}`);

    r = await api.post("/api/ai/generate-outline").set(auth()).send({});
    check("outline without topic → 400", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/ai/generate-outline").set(auth()).send({ topic: "Deep sea", style: "Narrative", numChapters: 2 });
    check("generate outline returns chapters", r.status === 200 && Array.isArray(r.body.outline) && r.body.outline.length === 2, `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

    r = await api.post("/api/ai/generate-chapter-content").set(auth()).send({ chapterTitle: "Chapter 1", style: "Narrative" });
    check("generate chapter content", r.status === 200 && !!r.body.content, `got ${r.status}`);

    r = await api.post("/api/ai/generate-chapter-content").set(auth()).send({ chapterTitle: "Chapter 1" });
    check("chapter content without style does not crash", r.status === 200, `got ${r.status} — style.toLowerCase() on undefined?`);

    r = await api.post("/api/ai/define").set(auth()).send({ text: "archive", context: "the silent archive" });
    check("word definition", r.status === 200 && !!r.body.definition, `got ${r.status}`);

    r = await api.post("/api/ai/define").set(auth()).send({});
    check("define without text → 400", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/ai/continue").set(auth()).send({ title: "The Silent Archive", currentChapters: [{ title: "Ch 1" }] });
    check("continue story", r.status === 200 && !!r.body.continuation, `got ${r.status}`);

    r = await api.post("/api/ai/continue").set(auth()).send({ title: "No chapters given" });
    check("continue without currentChapters does not crash", r.status === 200, `got ${r.status}`);

    r = await api.post("/api/ai/get-chunks").set(auth()).send({ text: "word ".repeat(700), size: 300 });
    check("get-chunks splits text", r.status === 200 && r.body.chunks.length === 3, `got ${r.status} len=${r.body.chunks?.length}`);

    r = await api.post("/api/ai/speak").set(auth()).send({ text: "hello" });
    check("speak without TTS key returns needsFallback", r.status === 400 && r.body.needsFallback === true, `got ${r.status} ${JSON.stringify(r.body)}`);
  }

  // -------------------------------------------------------- external lookups --
  section("External lookups");
  {
    let r = await api.get(`/api/books/related/${bookId}`).set(auth());
    check("related books", r.status === 200 && Array.isArray(r.body), `got ${r.status}`);

    r = await api.get(`/api/books/deals/${bookId}`).set(auth());
    check("book deals", r.status === 200 && Array.isArray(r.body) && r.body.length > 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

    // Google Books' anonymous quota is small and shared per IP. A 429 used to
    // surface as a 500 and break the whole reader sidebar.
    const rl = await api.post("/api/books").set(auth()).send({ title: "RATELIMIT Probe", author: "Ada", chapters: [] });
    r = await api.get(`/api/books/related/${rl.body._id}`).set(auth());
    check("related degrades to empty on upstream 429", r.status === 200 && Array.isArray(r.body) && r.body.length === 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);

    r = await api.get(`/api/books/deals/${rl.body._id}`).set(auth());
    check("deals falls back to search links on upstream 429", r.status === 200 && Array.isArray(r.body) && r.body.length > 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
  }

  // -------------------------------------------------------------- export --
  section("Export");
  {
    let r = await api.get(`/api/export/${bookId}/pdf`).set(auth()).buffer().parse(binaryParser);
    check("export PDF returns a pdf body", r.status === 200 && r.body?.length > 500 && r.body.slice(0, 4).toString() === "%PDF", `got ${r.status} type=${r.headers["content-type"]} len=${r.body?.length}`);

    r = await api.get(`/api/export/${bookId}/doc`).set(auth()).buffer().parse(binaryParser);
    check("export DOCX returns a zip body", r.status === 200 && r.body?.length > 500 && r.body.slice(0, 2).toString() === "PK", `got ${r.status} type=${r.headers["content-type"]} len=${r.body?.length}`);

    // A valid-but-empty docx is the exact failure mode the broken
    // parseMarkdownToDocx call produced, so assert on real chapter content.
    const docXml = require("zlib")
        .inflateRawSync(extractZipEntry(r.body, "word/document.xml"))
        .toString("utf8");
    check("DOCX contains the chapter title", docXml.includes("Chapter 1: Origins"), "chapter heading missing from document.xml");
    check("DOCX contains the chapter prose", docXml.includes("Edited"), "chapter body missing from document.xml");
    check("DOCX contains list items", docXml.includes("one") && docXml.includes("two"), "markdown list not rendered");

    r = await api.get("/api/export/64b7f9f9f9f9f9f9f9f9f9f9/pdf").set(auth());
    check("export missing book → 404", r.status === 404, `got ${r.status}`);

    // Round trip: a PDF this app exported must be re-ingestable by this app.
    // pdf-parse could not read pdfkit output, so this used to be impossible.
    const exported = await api.get(`/api/export/${bookId}/pdf`).set(auth()).buffer().parse(binaryParser);
    r = await api.post("/api/books/upload-pdf").set(auth()).attach("pdf", exported.body, "round-trip-1700.pdf");
    check("exported PDF can be re-ingested", r.status === 201 && r.body.chapters?.length > 0, `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);
  }

  // -------------------------------------------------------------- social --
  section("Social");
  {
    await Character.create({ name: "Gojo Satoru", mangaTitle: "Jujutsu Kaisen", image: "/x.png", votes: 5 });
    const char = await Character.findOne({ name: "Gojo Satoru" });

    let r = await api.get("/api/social/leaderboard");
    check("leaderboard is public", r.status === 200 && r.body.data.length === 1, `got ${r.status}`);

    r = await api.post(`/api/social/vote/${char._id}`).set(auth());
    check("vote increments", r.status === 200 && r.body.data.votes === 6, `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

    r = await api.post(`/api/social/vote/${char._id}`).set(auth());
    check("double vote rejected", r.status === 400, `got ${r.status}`);

    r = await api.post("/api/social/vote/f1").set(auth());
    check("vote on fallback id → 404 not 500", r.status === 404, `got ${r.status}`);

    r = await api.post("/api/social/discuss").set(auth()).send({ targetId: bookId, targetType: "book", content: "Great read." });
    check("post discussion", r.status === 201 || r.status === 200, `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

    r = await api.get(`/api/social/discuss/${bookId}`);
    check("read discussion thread", r.status === 200 && (r.body.data?.length === 1 || r.body.length === 1), `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

    r = await api.post("/api/social/discuss").set(auth()).send({ targetId: "jujutsu-kaisen", targetType: "manga", content: "Gojo wins." });
    check("manga discussion uses a slug target", r.status === 201 || r.status === 200, `got ${r.status}`);
  }

  // -------------------------------------------------------------- freemium --
  section("Freemium gate");
  {
    const User = require("../models/User");
    // Fresh free user with the counter already spent.
    const r0 = await api.post("/api/auth/register").send({ name: "Free", email: "free@test.dev", password: "secret123" });
    const free = { Authorization: `Bearer ${r0.body.token}` };
    await User.findByIdAndUpdate(r0.body._id, { synthesizedBookCount: 2 });

    let r = await api.post("/api/ai/generate-outline").set(free).send({ topic: "Anything" });
    check("spent free tier → 403 on outline", r.status === 403, `got ${r.status}`);

    await User.findByIdAndUpdate(r0.body._id, { tier: "premium" });
    r = await api.post("/api/ai/generate-outline").set(free).send({ topic: "Anything" });
    check("premium tier bypasses the gate", r.status === 200, `got ${r.status}`);

    // Counter must actually increment when a synthesized book is created.
    const r1 = await api.post("/api/auth/register").send({ name: "Counter", email: "counter@test.dev", password: "secret123" });
    const cu = { Authorization: `Bearer ${r1.body.token}` };
    await api.post("/api/books").set(cu).send({ title: "AI Book", author: "Counter", isSynthesized: true, chapters: [] });
    const after = await User.findById(r1.body._id);
    check("synthesizedBookCount increments on synthesis", after.synthesizedBookCount === 1, `got ${after.synthesizedBookCount}`);
  }

  // -------------------------------------------------------------- misc --
  section("Error shape");
  {
    let r = await api.get("/api/does-not-exist");
    check("unknown /api route returns JSON 404", r.status === 404 && !!r.body.message, `got ${r.status} type=${r.headers["content-type"]}`);

    r = await api.delete(`/api/books/${bookId}`).set(auth());
    check("delete book", r.status === 200, `got ${r.status}`);
    r = await api.get(`/api/books/${bookId}`).set(auth());
    check("deleted book is gone", r.status === 404, `got ${r.status}`);
  }

  // ------------------------------------------------------------------ done --
  await mongoose.disconnect();
  await mongod.stop();

  console.log(`\n${"─".repeat(60)}`);
  console.log(`\x1b[1m${pass} passed, ${fail} failed\x1b[0m`);
  if (fail) {
    console.log("\n\x1b[31mFailures:\x1b[0m");
    failures.forEach((f) => console.log(`  • ${f}`));
  }
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("\nHarness crashed:", e);
  process.exit(1);
});
