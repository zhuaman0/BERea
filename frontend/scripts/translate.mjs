// Fills every message missing from messages/<locale>.json by machine-translating messages/en.json
// with DeepL. Existing translations are never overwritten, so hand-edited copy is safe.
//
//   npm run translate              translate missing keys (needs DEEPL_API_KEY)
//   npm run translate -- --check   list missing keys and exit 1 if any (no API key needed)
//   npm run translate -- --dry-run show what would be translated, write nothing
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(FRONTEND_DIR, "messages");
const BASE_LOCALE = "en";
const TARGET_LOCALES = ["ru", "kk"];
const DEEPL_SOURCE_LANG = "en";
const DEEPL_BATCH_SIZE = 50;

// ICU plural/select messages need per-language grammar rules (Russian has four plural forms),
// which a sentence translator mangles — those are listed for a human instead.
const ICU_BRANCHING = /\{\s*\w+\s*,\s*(plural|select|selectordinal)\s*,/;
// `{name}` arguments become self-closing XML tags DeepL leaves untouched; next-intl rich-text
// tags like `<accent>…</accent>` are already XML, so DeepL keeps them and translates inside.
const ICU_ARGUMENT = /\{\s*(\w+)\s*\}/g;
const PLACEHOLDER_TAG = /<ph name="(\w+)"\s*\/>/g;

const args = new Set(process.argv.slice(2));
const isCheck = args.has("--check");
const isDryRun = args.has("--dry-run");

function loadEnv() {
  for (const file of [join(FRONTEND_DIR, ".env.local"), join(FRONTEND_DIR, "..", ".env")]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

function readMessages(locale) {
  const file = join(MESSAGES_DIR, `${locale}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

function writeMessages(locale, messages) {
  writeFileSync(join(MESSAGES_DIR, `${locale}.json`), `${JSON.stringify(messages, null, 2)}\n`);
}

/** Every string leaf of `base` that `target` lacks, as [dotted path, English text]. */
function missingEntries(base, target, prefix = "") {
  const missing = [];
  for (const [key, value] of Object.entries(base)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const targetValue = target?.[key];
    if (typeof value === "string") {
      if (typeof targetValue !== "string" || targetValue.trim() === "") missing.push([path, value]);
    } else if (value && typeof value === "object") {
      missing.push(...missingEntries(value, targetValue, path));
    }
  }
  return missing;
}

/** Writes `value` at `path`, keeping the base file's key order so diffs stay readable. */
function setInOrder(target, base, path, value) {
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) {
    target[head] = value;
  } else {
    if (!target[head] || typeof target[head] !== "object") target[head] = {};
    setInOrder(target[head], base[head], rest.join("."), value);
  }
  const ordered = {};
  for (const key of Object.keys(base)) if (key in target) ordered[key] = target[key];
  for (const key of Object.keys(target)) if (!(key in ordered)) ordered[key] = target[key];
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, ordered);
}

function toDeepL(text) {
  return text.replace(ICU_ARGUMENT, (_, name) => `<ph name="${name}"/>`);
}

function fromDeepL(text) {
  return text.replace(PLACEHOLDER_TAG, (_, name) => `{${name}}`);
}

async function main() {
  const base = readMessages(BASE_LOCALE);
  const plan = TARGET_LOCALES.map((locale) => {
    const target = readMessages(locale);
    const missing = missingEntries(base, target);
    return {
      locale,
      target,
      translatable: missing.filter(([, text]) => !ICU_BRANCHING.test(text)),
      manual: missing.filter(([, text]) => ICU_BRANCHING.test(text)),
    };
  });

  const totalMissing = plan.reduce((sum, p) => sum + p.translatable.length + p.manual.length, 0);

  if (isCheck || isDryRun) {
    for (const { locale, translatable, manual } of plan) {
      for (const [path] of translatable) console.log(`${locale}  missing  ${path}`);
      for (const [path] of manual) console.log(`${locale}  missing  ${path}  (plural/select, translate by hand)`);
    }
    console.log(totalMissing === 0 ? "All locales are complete." : `${totalMissing} missing message(s).`);
    process.exit(isCheck && totalMissing > 0 ? 1 : 0);
  }

  loadEnv();
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("DEEPL_API_KEY is not set. Add it to frontend/.env.local (free key: https://www.deepl.com/pro-api).");
    process.exit(1);
  }

  const { Translator } = await import("deepl-node");
  const translator = new Translator(apiKey);
  const supported = new Set((await translator.getTargetLanguages()).map((lang) => lang.code.toLowerCase()));

  let translated = 0;
  for (const { locale, target, translatable, manual } of plan) {
    if (!supported.has(locale)) {
      console.warn(`${locale}: DeepL does not support this language — ${translatable.length} message(s) left for manual translation.`);
      continue;
    }
    for (let i = 0; i < translatable.length; i += DEEPL_BATCH_SIZE) {
      const batch = translatable.slice(i, i + DEEPL_BATCH_SIZE);
      const results = await translator.translateText(
        batch.map(([, text]) => toDeepL(text)),
        DEEPL_SOURCE_LANG,
        locale,
        { tagHandling: "xml", ignoreTags: ["ph"], preserveFormatting: true },
      );
      batch.forEach(([path], index) => {
        setInOrder(target, base, path, fromDeepL(results[index].text));
        console.log(`${locale}  ✓  ${path}`);
      });
      translated += batch.length;
    }
    writeMessages(locale, target);
    for (const [path] of manual) console.warn(`${locale}  !  ${path} uses plural/select — translate it by hand.`);
  }

  console.log(`Done: ${translated} message(s) translated.`);
}

await main();
