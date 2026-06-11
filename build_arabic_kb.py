#!/usr/bin/env python3
"""
بناء قاعدة المعرفة العربية من الكتب الإسلامية
يستخرج النص من PDFs، يقطعه، ويبني فهرس TF-IDF
"""

import os, sys, json, re, pickle, time, hashlib
import fitz
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz

ARABIC_DIR = "islamic_books"
os.makedirs(ARABIC_DIR, exist_ok=True)
os.makedirs(f"{ARABIC_DIR}/chunks", exist_ok=True)
os.makedirs(f"{ARABIC_DIR}/graph", exist_ok=True)

PDF_FILES = {
    "الفصل في الملل والأهواء والنحل": "/tmp/codex-web-uploads/f-HMeFiO/الفصل_في_الملل_والأهواء_والنحل_13197_Foulabook_com_.pdf",
    "هداية الحيارى في أجوبة اليهود والنصارى": "/tmp/codex-web-uploads/f-etvEE3/هداية_الحيارى_فى_أجوبة_اليهود_و_النصارى_Foulabook_com_.pdf",
    "الجواب الصحيح لمن بدل دين المسيح": "/tmp/codex-web-uploads/f-AHGcFX/الجواب_الصحيح_لمن_بدل_دين_المسيح.pdf",
    "إظهار الحق": "/tmp/codex-web-uploads/f-HKsLbQ/إظهار الحق_11296_Foulabook.com_.pdf",
    "العقيدة المسيحية - doctrine": "/tmp/codex-web-uploads/f-tD5yvS/doctrine03826.pdf",
}

# Arabic stopwords
ARABIC_STOPS = [
    "من", "في", "إلى", "عن", "على", "الذي", "التي", "الذين", "اللواتي",
    "كان", "كانت", "كانوا", "ليس", "ليست", "يكون", "تكون",
    "قد", "لن", "لم", "لما", "إن", "أن", "إذا", "حين", "بعد", "قبل",
    "مع", "عند", "فوق", "تحت", "بين", "خلال", "دون",
    "هذا", "هذه", "هذان", "هؤلاء", "ذلك", "تلك", "أولئك",
    "هو", "هي", "هم", "هن", "أنا", "نحن", "أنت", "أنتم", "أنتن",
    "و", "ف", "ثم", "أو", "أم", "لا", "بل", "لكن",
    "كل", "بعض", "أي", "كم", "كيف", "متى", "أين", "ما", "ماذا",
    "لقد", "هل", "أ", "يا", "أيها", "أيتها",
    "كان", "يكون", "كن", "صار", "أصبح", "أمسى", "ظل", "بات",
    "على", "إلى", "في", "من", "عن", "الباء", "الكاف", "اللام",
    "إذا", "إذ", "حيث", "حين", "بينما", "بعدما", "قبلما",
    "غير", "سوى", "نفس", "ذات", "كلا", "كلتا",
]

def extract_clean_text(path: str) -> str:
    """استخراج النص من PDF وتنظيفه"""
    doc = fitz.open(path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text()
        # تنظيف النص
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\(\)\[\]\{\}ء-ي]', '', text)
        text = text.strip()
        if len(text) > 50:  # تجاهل الصفحات الفارغة
            pages.append({"page": i+1, "text": text, "words": len(text.split())})
    doc.close()
    return pages

def chunk_pages(pages: list, source: str, chunk_size: int = 1500, overlap: int = 200):
    """تقسيم النص إلى قطع متداخلة"""
    chunks = []
    for pg in pages:
        text = pg["text"]
        words = text.split()
        if len(words) <= chunk_size:
            chunks.append({
                "source": source,
                "page": pg["page"],
                "text": text,
                "words": len(words),
                "section": pg["page"]
            })
        else:
            # تقسيم الصفحات الطويلة
            for start in range(0, len(words), chunk_size - overlap):
                chunk_words = words[start:start + chunk_size]
                chunk_text = " ".join(chunk_words)
                chunks.append({
                    "source": source,
                    "page": pg["page"],
                    "text": chunk_text,
                    "words": len(chunk_words),
                    "section": f"{source} ص {pg['page']}"
                })
    return chunks

def extract_concepts(chunks: list) -> list:
    """استخراج المفاهيم الرئيسية من النصوص"""
    # مفاهيم إسلامية معروفة
    concepts = [
        "التوحيد", "الرسالة", "النبوة", "القرآن", "السنة", "الإنجيل", "التوراة",
        "عيسى", "مريم", "محمد", "موسى", "إبراهيم", "الله", "الكتاب المقدس",
        "التحريف", "النسخ", "التثليث", "التوحيد", "الصليب", "الفداء",
        "القيامة", "المسيح", "الروح القدس", "الآب", "الابن",
        "الإسلام", "النصرانية", "اليهودية", "الملل", "النحل",
        "ابن حزم", "ابن تيمية", "ابن القيم", "الذهبي",
        "الجدل", "المناظرة", "الحوار", "الدليل", "البرهان",
        "العبادة", "الشرك", "الكفر", "الإيمان", "الكفر",
        "المعجزة", "الوحي", "التنزيل", "التفسير", "التأويل",
        "الألوهية", "الربوبية", "الأسماء والصفات",
        "القضاء والقدر", "الجنة", "النار", "البعث", "الحساب",
    ]
    
    nodes = []
    seen = set()
    
    for i, chunk in enumerate(chunks):
        text_lower = chunk["text"][:500].lower()
        for concept in concepts:
            if concept in text_lower and concept not in seen:
                seen.add(concept)
                nodes.append({
                    "id": concept.replace(" ", "_"),
                    "label": concept,
                    "chunk_index": i,
                    "metadata": {
                        "source": chunk["source"],
                        "page": chunk["page"],
                        "description": chunk["text"][:200]
                    }
                })
    
    return nodes

# ─── التشغيل الرئيسي ─────────────────────────────────────────
t0 = time.time()
all_chunks = []
all_sources = []

print("📚 بدء استخراج النصوص من الكتب الإسلامية...")
print("=" * 60)

for name, path in PDF_FILES.items():
    print(f"\n📖 {name}...")
    try:
        pages = extract_clean_text(path)
        chunks = chunk_pages(pages, name)
        all_chunks.extend(chunks)
        all_sources.append(name)
        print(f"   ✅ {len(pages)} صفحات → {len(chunks)} قطعة")
    except Exception as e:
        print(f"   ❌ خطأ: {e}")

print(f"\n{'=' * 60}")
print(f"📊 الإجمالي: {len(all_chunks)} قطعة من {len(all_sources)} كتاب")

# حفظ القطع
print("\n💾 حفظ القطع...")
with open(f"{ARABIC_DIR}/chunks/all_chunks.json", "w", encoding="utf-8") as f:
    json.dump(all_chunks, f, ensure_ascii=False, indent=1)

# بناء فهرس TF-IDF
print("🔧 بناء فهرس TF-IDF...")
texts = [c["text"] for c in all_chunks]
vec = TfidfVectorizer(
    max_features=8000,
    stop_words=ARABIC_STOPS,
    ngram_range=(1, 2),
    analyzer="word",
    token_pattern=r"(?u)\b\w+\b",
)
matrix = vec.fit_transform(texts)
print(f"   ✅ المصفوفة: {matrix.shape}")

save_npz(f"{ARABIC_DIR}/chunks/matrix.npz", matrix)
with open(f"{ARABIC_DIR}/chunks/tfidf_config.pkl", "wb") as f:
    pickle.dump({
        "max_features": 8000,
        "stop_words": ARABIC_STOPS,
        "ngram_range": (1, 2),
        "vocabulary": vec.vocabulary_,
        "idf": vec.idf_,
    }, f)

# استخراج المفاهيم
print("🔍 استخراج المفاهيم...")
nodes = extract_concepts(all_chunks)
graph = {"nodes": nodes}
with open(f"{ARABIC_DIR}/graph/graph.json", "w", encoding="utf-8") as f:
    json.dump(graph, f, ensure_ascii=False, indent=1)
print(f"   ✅ {len(nodes)} مفهوم")

elapsed = time.time() - t0
print(f"\n✅ تم الانتهاء في {elapsed:.1f} ثانية")
print(f"📁 المسار: {ARABIC_DIR}/")
