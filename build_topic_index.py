"""
Topic Index Builder — inspired by book-to-skill's glossary + patterns approach.
Groups chunks by topic keywords for faster, more targeted retrieval.
"""
import json, re, pickle, os
from collections import defaultdict, Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz, load_npz
import unicodedata

CHUNKS_FILE = "islamic_books_merged/chunks/all_chunks.json"
TOPIC_INDEX_FILE = "islamic_books_merged/chunks/topic_index.pkl"

# Islamic theology topics with keywords (Arabic + English)
TOPICS = {
    "التوحيد/Tawheed": [
        "توحيد", "إله", "الله", "أحد", "الصمد", "الوهية", "tawheed", "monotheism", "oneness", "alone"
    ],
    "التثليث/Trinity": [
        "تثليث", "ثالوث", "ثلاثة", "أقانيم", "trinity", "triune", "three persons", "godhead", "son father holy"
    ],
    "عيسى المسيح/Jesus Christ": [
        "عيسى", "المسيح", "ابن مريم", "يسوع", "jesus", "christ", "son of mary", "messiah"
    ],
    "مريم العذراء/Virgin Mary": [
        "مريم", "العذراء", "mary", "virgin", "mother of jesus"
    ],
    "الصلب والفداء/Crucifixion": [
        "صلب", "صليب", "فداء", "صلبه", "صلبوه", "crucifixion", "cross", "crucify", "crucified", "redemption"
    ],
    "الكتاب المقدس/Bible": [
        "الكتاب", "المقدس", "الإنجيل", "التوراة", "العهد", "bible", "gospel", "scripture", "old testament", "new testament"
    ],
    "تحريف الكتاب المقدس/Bible Corruption": [
        "تحريف", "تبديل", "حرف", "corruption", "corrupted", "distortion", "changed", "altered"
    ],
    "البشارات/Prophecies": [
        "بشارة", "بشارات", "نبأ", "prophecy", "prophecies", "foretold", "predicted", "prophet"
    ],
    "محمد صلى الله عليه وسلم/Muhammad": [
        "محمد", "أحمد", "الرسول", "النبي", "muhammad", "prophet muhammad", "ahmad", "messenger"
    ],
    "النبوة/Prophethood": [
        "نبوة", "نبي", "رسول", "الأنبياء", "الرسل", "prophet", "prophethood", "messenger", "apostle"
    ],
    "القرآن/Quran": [
        "القرآن", "القرآن", "quran", "koran", "qur'an", "surah", "ayah", "آية", "سورة"
    ],
    "الرد على النصارى/Response to Christians": [
        "نصارى", "مسيحي", "مسيحية", "christian", "christianity", "christians", "catholic", "protestant"
    ],
    "اليهود/Jews": [
        "يهود", "يهودي", "jew", "jewish", "judaism", "israelites", "بنو إسرائيل"
    ],
    "الملل والنحل/Sects & Heresies": [
        "ملل", "نحل", "فرق", "مذاهب", "sect", "heresy", "denomination", "doctrine"
    ],
    "أحمد ديدات/Ahmed Deedat": [
        "ديدات", "deedat", "ahmed deedat"
    ],
    "ابن حزم/Ibn Hazm": [
        "ابن حزم", "ابن حزم", "ibn hazm", "al-zahiri"
    ],
    "ابن تيمية/Ibn Taymiyyah": [
        "ابن تيمية", "ابن تيمية", "ibn taymiyyah", "taymiyya"
    ],
    "ابن القيم/Ibn Qayyim": [
        "ابن القيم", "ابن القيم", "ibn qayyim", "qayyim"
    ],
    "رحمة الله الهندي/Rahmatullah Kairanvi": [
        "الهندي", "كيرواني", "الكيرواني", "إظهار", "kairanvi", "rahmatullah", "izhar"
    ],
    "بارت إيرمان/Bart Ehrman": [
        "إيرمان", "ehrman", "misquoting", "bart"
    ],
    "النسخ/Abrogation": [
        "نسخ", "منسوخ", "abrogation", "abrogate", "supersede", "naskh"
    ],
    "بولس الرسول/Paul the Apostle": [
        "بولس", "paul", "saul", "apostle paul"
    ],
    "الروح القدس/Holy Spirit": [
        "الروح القدس", "روح القدس", "holy spirit", "paraclete"
    ],
    "يوم القيامة/Judgment Day": [
        "قيامة", "القيامة", "day of judgment", "resurrection", "last day", "eschatology"
    ],
    "المناظرة/Debate": [
        "مناظرة", "جدال", "حوار", "debate", "dialogue", "argument", "apologetics"
    ],
}

def normalize_arabic(text):
    """Normalize Arabic text for matching."""
    text = unicodedata.normalize("NFKC", text)
    # Normalize alef variants
    text = re.sub(r'[إأآا]', 'ا', text)
    # Normalize teh marbuta
    text = text.replace('ة', 'ه')
    # Normalize ya
    text = text.replace('ي', 'ى')
    return text.lower()

def build_topic_index():
    chunks = json.load(open(CHUNKS_FILE, encoding="utf-8"))
    print(f"Building topic index for {len(chunks)} chunks...", flush=True)
    
    # For each chunk, find matching topics
    topic_map = defaultdict(list)  # topic -> list of chunk indices
    
    for idx, chunk in enumerate(chunks):
        text = chunk.get("text", "")
        text_lower = normalize_arabic(text)
        text_en = text.lower()
        
        for topic, keywords in TOPICS.items():
            for kw in keywords:
                kw_lower = normalize_arabic(kw)
                if kw_lower in text_lower or kw.lower() in text_en:
                    topic_map[topic].append(idx)
                    break  # one match per topic per chunk
    
    # Deduplicate
    for topic in topic_map:
        topic_map[topic] = sorted(set(topic_map[topic]))
    
    # Stats
    print(f"\nTopics with chunks:", flush=True)
    for topic, indices in sorted(topic_map.items(), key=lambda x: -len(x[1])):
        print(f"  {topic:40s} | {len(indices):4d} chunks", flush=True)
    
    # Save
    index_data = {
        "topics": dict(topic_map),
        "topic_keywords": TOPICS,
        "topic_names_ar": {t: t.split("/")[0] for t in TOPICS},
        "topic_names_en": {t: t.split("/")[1] if "/" in t else t for t in TOPICS},
    }
    pickle.dump(index_data, open(TOPIC_INDEX_FILE, "wb"))
    print(f"\n✅ Saved topic index to {TOPIC_INDEX_FILE}", flush=True)
    
    # Update chunks with topic tags
    for idx, chunk in enumerate(chunks):
        chunk_topics = [t for t, indices in topic_map.items() if idx in indices]
        if chunk_topics:
            if "topics" not in chunk:
                chunk["topics"] = []
            chunk["topics"] = list(set(chunk["topics"] + chunk_topics))
    
    json.dump(chunks, open(CHUNKS_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"✅ Updated chunks with topic tags", flush=True)
    
    return topic_map

if __name__ == "__main__":
    build_topic_index()
