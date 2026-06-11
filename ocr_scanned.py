"""OCR scanned English PDFs: Christ + Misquoting Jesus. Checkpoint-saved."""
import fitz, os, subprocess, json, re, time, sys
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz
import pickle
from collections import Counter

PDFS = [
    ("Christ - Ahmed Deedat (English)", "/tmp/codex-web-uploads/f-lU61eo/christ_en.pdf"),
    ("Misquoting Jesus - Bart Ehrman (English)", "/tmp/codex-web-uploads/f-OT2cFg/misquoting_jesus_the_story_behind_who_changed_the_bible_and_why.pdf"),
]

KB_CHUNKS_FILE = "islamic_books_merged/chunks/all_chunks.json"
CHECKPOINT_FILE = "ocr_scanned_checkpoint.json"

with open(KB_CHUNKS_FILE, encoding="utf-8") as f:
    existing = json.load(f)

t0 = time.time()
done_sources = set()
if os.path.exists(CHECKPOINT_FILE):
    cp = json.load(open(CHECKPOINT_FILE))
    all_chunks = cp["chunks"]
    done_sources = set(cp.get("done_parts", []))
    print(f"Resumed: {len(all_chunks)} saved, done: {done_sources}", flush=True)
else:
    all_chunks = []

for src_name, path in PDFS:
    if src_name in done_sources:
        print(f"Skipping {src_name}", flush=True)
        continue
    
    doc = fitz.open(path)
    pc = doc.page_count
    print(f"OCR: {src_name} ({pc}p)...", flush=True)
    
    for i in range(pc):
        page = doc[i]
        txt = page.get_text().strip()
        # If text layer exists, use it
        if len(txt) > 100:
            clean = re.sub(r'\s+', ' ', txt).strip()
            wc = len(clean.split())
            all_chunks.append({
                "source": src_name, "part": "", "page": i+1,
                "text": clean, "words": wc, "word_count": wc
            })
            if (i+1) % 20 == 0 or i == pc-1:
                print(f"  p{i+1}/{pc} (native text) | {len(all_chunks)} tot | {time.time()-t0:.0f}s", flush=True)
            continue
        
        # OCR needed
        pix = page.get_pixmap(dpi=150)
        tp = f"/tmp/ocr_sc_{i}_{src_name[:3]}.png"
        pix.save(tp)
        try:
            r = subprocess.run(["tesseract", tp, "stdout", "-l", "eng", "--psm", "6"],
                              capture_output=True, text=True, timeout=30)
            txt = r.stdout.strip()
        except:
            txt = ""
        if os.path.exists(tp):
            os.unlink(tp)
        if len(txt) > 50:
            clean = re.sub(r'\s+', ' ', txt).strip()
            wc = len(clean.split())
            all_chunks.append({
                "source": src_name, "part": "", "page": i+1,
                "text": clean, "words": wc, "word_count": wc
            })
        if (i+1) % 20 == 0 or i == pc-1:
            print(f"  p{i+1}/{pc} (OCR) | {len(all_chunks)} tot | {time.time()-t0:.0f}s", flush=True)
    
    doc.close()
    done_sources.add(src_name)
    json.dump({"chunks": all_chunks, "done_parts": list(done_sources)},
              open(CHECKPOINT_FILE, "w"), ensure_ascii=False)
    print(f"  {src_name} done, checkpoint saved", flush=True)

print(f"\nOCR done: {len(all_chunks)} chunks in {time.time()-t0:.0f}s", flush=True)

all_data = existing + all_chunks
with open(KB_CHUNKS_FILE, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=1)
print(f"Merged: {len(existing)} + {len(all_chunks)} = {len(all_data)}", flush=True)

STOPS = ["the","and","for","are","but","not","you","all","any","can","had","her","was","one","our","out","has","have","been","they","them","their","that","this","with","from","which","were","when","where","who","whom","why","how","will","about","into","over","than","then","some","such","only","after","before","between","through","during","more","also","very","well","just","like","said","would","could","should","may","might","shall","being","doing","having","there","these","those","other","من","في","إلى","عن","على","هذا","هذه","ذلك","كان","قد","لن","لم","و","ف","ثم","أو","كل","بعض","غير","ما","لا","هل"]
texts = [c["text"] for c in all_data]
vec = TfidfVectorizer(max_features=18000, stop_words=STOPS, ngram_range=(1,2), token_pattern=r"(?u)\b\w+\b")
matrix = vec.fit_transform(texts)
save_npz("islamic_books_merged/chunks/matrix.npz", matrix)
with open("islamic_books_merged/chunks/tfidf_config.pkl", "wb") as f:
    pickle.dump({"max_features":18000,"stop_words":STOPS,"ngram_range":(1,2),"vocabulary":vec.vocabulary_,"idf":vec.idf_}, f)

for s, count in Counter(c["source"] for c in all_data).most_common():
    wc = sum(c["word_count"] for c in all_data if c["source"] == s)
    print(f"  {s[:65]:65s} | {count:4d} | {wc:6,d}w", flush=True)
print(f"\n✅ {len(all_data)} total chunks", flush=True)

if os.path.exists(CHECKPOINT_FILE):
    os.unlink(CHECKPOINT_FILE)
