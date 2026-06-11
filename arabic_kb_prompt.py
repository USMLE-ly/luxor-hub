"""
الموسوعة الإسلامية - قاعدة المعرفة والملفات المسبقة
Islamic knowledge base with pre-computed TF-IDF + comprehensive system prompt
"""

import json, pickle, os, time
from scipy.sparse import load_npz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import unicodedata
import re as _re
from collections import defaultdict as _defaultdict

# تحميل قاعدة المعرفة
ARABIC_DIR = "islamic_books_merged"

def load_knowledge_base():
    """تحميل القطع والمصفوفة وفهرس الموضوعات"""
    t0 = time.time()
    try:
        with open(f"{ARABIC_DIR}/chunks/tfidf_config.pkl", "rb") as f:
            cfg = pickle.load(f)
        
        vec = TfidfVectorizer(
            max_features=cfg["max_features"],
            stop_words=cfg["stop_words"],
            ngram_range=cfg["ngram_range"],
            vocabulary=cfg["vocabulary"],
            token_pattern=r"(?u)\b\w+\b",
        )
        vec.idf_ = cfg["idf"]
        mat = load_npz(f"{ARABIC_DIR}/chunks/matrix.npz")
        
        with open(f"{ARABIC_DIR}/chunks/all_chunks.json", encoding="utf-8") as f:
            chunks = json.load(f)
        
        # تحميل فهرس الموضوعات
        topic_index = None
        topic_path = f"{ARABIC_DIR}/chunks/topic_index.pkl"
        if os.path.exists(topic_path):
            with open(topic_path, "rb") as f:
                topic_index = pickle.load(f)
        
        print(f"✅ قاعدة المعرفة: {len(chunks)} قطعة, {mat.shape[1]} ميزة ({time.time()-t0:.2f}s)")
        return vec, mat, chunks, topic_index
    except Exception as e:
        print(f"⚠️ قاعدة المعرفة غير متوفرة: {e}")
        return None, None, [], None

def normalize_text(text):
    """تطبيع النص للبحث"""
    t = unicodedata.normalize("NFKC", text.lower())
    t = _re.sub(r'[إأآا]', 'ا', t)
    t = t.replace('ة', 'ه').replace('ي', 'ى')
    return t

def detect_topic(query: str, topic_index: dict) -> list:
    """اكتشاف الموضوع من السؤال"""
    if topic_index is None:
        return []
    q_norm = normalize_text(query)
    q_en = query.lower()
    matched = []
    for topic, keywords in topic_index.get("topic_keywords", {}).items():
        for kw in keywords:
            kw_norm = normalize_text(kw)
            if kw_norm in q_norm or kw.lower() in q_en:
                matched.append(topic)
                break
    return matched

def retrieve(query: str, vec, mat, chunks, k: int = 5, topic_index=None):
    """البحث في قاعدة المعرفة مع تصفية حسب الموضوع أولاً"""
    if vec is None:
        return []
    
    # 1. كشف الموضوع
    topics = []
    if topic_index:
        topics = detect_topic(query, topic_index)
    
    # 2. تحديد القطع التي يجب البحث فيها
    if topics:
        search_indices = set()
        for t in topics:
            if t in topic_index.get("topics", {}):
                for idx in topic_index["topics"][t]:
                    search_indices.add(idx)
        
        if search_indices:
            # بحث في القطع المصفاة فقط
            filtered_chunks = [chunks[i] for i in sorted(search_indices)]
            if not filtered_chunks:
                filtered_chunks = chunks
        else:
            filtered_chunks = chunks
    else:
        filtered_chunks = chunks
    
    # 3. TF-IDF على القطع المحددة
    if len(filtered_chunks) == len(chunks):
        q = unicodedata.normalize("NFKC", query.lower())
        qv = vec.transform([q])
        scores = cosine_similarity(qv, mat).flatten()
        
        results = []
        for idx in scores.argsort()[::-1]:
            if scores[idx] < 0.05:
                break
            results.append({
                "score": float(scores[idx]),
                "text": chunks[idx]["text"][:500],
                "source": chunks[idx]["source"],
                "page": chunks[idx]["page"],
            })
            if len(results) >= k:
                break
    else:
        # بناء مصفوفة للقطع المصفاة
        try:
            f_texts = [c["text"] for c in filtered_chunks]
            f_vec = TfidfVectorizer(
                max_features=5000,
                stop_words=["the","and","for","are","but","not","you","all","any","can","had","her","was","one","our","out","has","have","been","they","them","their","that","this","with","from","which","were","when","where","who","whom","why","how"],
                token_pattern=r"(?u)\b\w+\b",
            )
            f_mat = f_vec.fit_transform(f_texts)
            q = normalize_text(query)
            qv = f_vec.transform([q])
            scores = cosine_similarity(qv, f_mat).flatten()
            
            results = []
            for idx in scores.argsort()[::-1]:
                if scores[idx] < 0.05:
                    break
                real_idx = sorted(search_indices)[idx]
                results.append({
                    "score": float(scores[idx]),
                    "text": chunks[real_idx]["text"][:500],
                    "source": chunks[real_idx]["source"],
                    "page": chunks[real_idx]["page"],
                })
                if len(results) >= k:
                    break
        except Exception:
            results = []
    
    return results

# النظام الإسلامي الشامل - يجمع أدلة من جميع الكتب
ISLAMIC_SYSTEM_PROMPT = """[النظام: الشيخ أبو عباس]

أنت عالم إسلامي كبير، من كبار دعاة الإسلام، ألفت آلاف المجلدات في الدفاع عن الدين ودرست علوم الشريعة والمقارنة لأكثر من نصف قرن. تتقن العربية الفصحى وتحفظ القرآن والتفسير.

## شخصيتك
- عالم رباني، صاحب مدرسة دعوية. ترد على الشبهات بالحكمة والبرهان
- تستشهد بالقرآن (السورة والآية) والحديث وأقوال ابن حزم وابن تيمية وابن القيم
- تذكر المصادر من الكتب التي لديك (المكتبة الإسلامية: الفصل في الملل، الجواب الصحيح، إظهار الحق، هداية الحيارى، ماذا قال المسيح، هل الكتاب المقدس كلام الله، وغيرها)

## أصول الرد
1️⃣ التوحيد أولاً: {قُلْ هُوَ اللَّهُ أَحَدٌ}
2️⃣ عيسى عبد الله ورسوله: {إِنْ هُوَ إِلَّا عَبْدٌ أَنْعَمْنَا عَلَيْهِ}
3️⃣ التحريف واقع: {يُحَرِّفُونَ الْكَلِمَ عَن مَّوَاضِعِهِ}
4️⃣ الصلب شُبّه: {وَمَا قَتَلُوهُ وَمَا صَلَبُوهُ وَلَٰكِن شُبِّهَ لَهُمْ}
5️⃣ محمد في البشارات: {الَّذِينَ يَتَّبِعُونَ الرَّسُولَ النَّبِيَّ الْأُمِّيَّ}

## قواعد الرد
- ابدأ بالدليل ثم اذكر المصدر (اسم الكتاب، إن أمكن)
- كن موضوعياً مهذباً: {ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ}
- إذا لم تعرف الجواب قل: "هذا يحتاج إلى بحث أعمق"
- أجب بالعربية الفصحى دائماً"""

# أسئلة وأجوبة سريعة
ARABIC_COMMON_QA = {
    "من أنت": "🌙 *أبو عباس* - بوت إسلامي للحوار والمناظرة. أسألني عن الإسلام والرد على الشبهات.",
    "ما الإسلام": "📖 *الإسلام* هو الاستسلام لله بالتوحيد والانقياد له بالطاعة. قال تعالى: {إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ} [آل عمران: 19]. أركانه: الشهادتان، الصلاة، الزكاة، الصوم، الحج.",
    "من هو محمد": "محمد صلى الله عليه وسلم هو خاتم الأنبياء والمرسلين. قال تعالى: {وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ} [الأنبياء: 107]. ولد في مكة عام الفيل، ونزل عليه القرآن، وهاجر إلى المدينة، وتوفي بعد أن بلغ الرسالة.",
    "من هو عيسى": "عيسى عليه السلام نبي الله ورسوله، ابن مريم البتول. قال تعالى: {إِنْ هُوَ إِلَّا عَبْدٌ أَنْعَمْنَا عَلَيْهِ} [الزخرف: 59]. ليس ابن الله، ولم يصلب، بل رفعه الله إليه. سينزل آخر الزمان حكماً مقسطاً.",
    "ما هو القرآن": "القرآن الكريم هو كلام الله المنزل على محمد صلى الله عليه وسلم، المتعبد بتلاوته، المنقول بالتواتر. قال تعالى: {إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ} [الحجر: 9]. عدد سوره 114 سورة.",
    "ما هو التثليث": "التثليث هو عقيدة النصارى بأن الله واحد في ثلاثة أقانيم: الآب والابن والروح القدس. قال ابن حزم رحمه الله: هذا لم يذكره المسيح قط، ولا نبي قبله، وهو مخالف للعقل وللتوحيد الخالص الذي دعا إليه جميع الأنبياء.",
    "هل القرآن محرف": "لا، القرآن الكريم محفوظ بحفظ الله تعالى. قال تعالى: {إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ} [الحجر: 9]. أما الكتب السابقة فقد وقع فيها التحريف كما أخبر الله.",
    "ما رأيك في المسيحية": "المسيحية دين سماوي في أصله، بشر به عيسى عليه السلام، ولكن دخل فيه التحريف والتبديل. نكرم المسيح عليه السلام كنبي من أنبياء الله، ونخالف النصارى في ألوهيته وفي عقيدة التثليث والصليب.",
}

