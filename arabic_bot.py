#!/usr/bin/env python3
"""
🤖 أبو عباس - بوت إسلامي مع قاعدة معرفة من كتب كبار العلماء
Arabic Islamic Dialogue Bot — with TF-IDF retrieval from classical Islamic texts
Bot: @Abo_abas_bot
"""

import os, sys, json, time, re, asyncio, logging
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import requests as _req
import unicodedata

TOKEN = "8710655845:AAGUeVCKYsV4RD-sUGUaASzD0UdAjVW6RIE"
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
log = logging.getLogger('arabic_bot')

API_URL = "https://opencode.ai/zen/v1/chat/completions"
_API_SESSION = _req.Session()
_API_SESSION.headers.update({"Content-Type": "application/json"})

# تحميل قاعدة المعرفة
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabic_kb_prompt import (
    ISLAMIC_SYSTEM_PROMPT, ARABIC_COMMON_QA,
    load_knowledge_base, retrieve
)
VEC, MAT, CHUNKS, TOPIC_INDEX = load_knowledge_base()
if CHUNKS:
    log.info(f"📚 قاعدة المعرفة: {len(CHUNKS)} قطعة جاهزة")
else:
    log.warning("⚠️ قاعدة المعرفة غير متوفرة - استخدام API فقط")

# إدارة المهام
AI_EXECUTOR = ThreadPoolExecutor(max_workers=2)
RESPONSE_CACHE = OrderedDict()
CACHE_MAX = 200

# مفاهيم رئيسية للاسترجاع السريع
KEY_CONCEPTS = {
    "التوحيد", "التثليث", "عيسى", "المسيح", "مريم", "الصلب", "الفداء",
    "التحريف", "الإنجيل", "التوراة", "القرآن", "النبوة", "الرسالة",
    "محمد", "ابن حزم", "ابن تيمية", "ابن القيم", "إظهار الحق",
    "النصارى", "اليهود", "الملل", "النحل", "النسخ", "البشارات",
    "الصليب", "القيامة", "الروح القدس", "الآب", "الابن",
}

def _sync_query(user_prompt: str, timeout: int = 20) -> Optional[str]:
    """استدعاء API مع إعادة المحاولة"""
    for attempt in range(2):
        try:
            r = _API_SESSION.post(API_URL, json={
                "model": "deepseek-v4-flash-free",
                "messages": [
                    {"role": "system", "content": ISLAMIC_SYSTEM_PROMPT},
                    {"role": "user", "content": "أجب بتنسيق ماركداون مع نقاط وفقرات. استشهد بالقرآن والسنة وبالكتاب المقدس عند الحاجة. أظهر علمك الواسع وأسلوبك كعالم داعية.\n\n" + user_prompt}
                ],
                "max_tokens": 600,
                "temperature": 0.7,
                "top_p": 0.9,
            }, timeout=timeout)
            if r.status_code == 200:
                msg = r.json()["choices"][0]["message"]
                content = (msg.get("content") or "").strip()
                if not content:
                    content = (msg.get("reasoning_content") or "").strip()
                if content:
                    return content
            elif r.status_code == 429:
                time.sleep(1)
        except Exception as e:
            log.warning(f"API error: {e}")
    return None

async def query_ai(prompt: str, timeout: int = 20) -> Optional[str]:
    """استدعاء غير متزامن"""
    cache_key = unicodedata.normalize("NFKC", prompt[:60])
    if cache_key in RESPONSE_CACHE:
        return RESPONSE_CACHE[cache_key]
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(AI_EXECUTOR, _sync_query, prompt, timeout)
    if result:
        RESPONSE_CACHE[cache_key] = result
        if len(RESPONSE_CACHE) > CACHE_MAX:
            RESPONSE_CACHE.popitem(last=False)
    return result

# ─── تليجرام بوت ─────────────────────────────────────────────
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🌙 *أهلاً بك في أبو عباس* 🤖\n\n"
        "بوت إسلامي للرد على الشبهات والمناظرة باللغة العربية.\n"
        "مزود بقاعدة معرفة من كتب كبار العلماء:\n"
        "📚 الفصل في الملل - ابن حزم\n"
        "📚 هداية الحيارى - ابن القيم\n"
        "📚 الجواب الصحيح - ابن تيمية\n"
        "📚 إظهار الحق - رحمة الله الهندي\n\n"
        "اسأل عن أي موضوع ديني:\n"
        "• التوحيد والرد على التثليث\n"
        "• مكانة عيسى عليه السلام\n"
        "• تحريف الكتاب المقدس\n"
        "• البشارات بمحمد\n"
        "• الصليب والفداء\n\n"
        "الأوامر: `/start` `/help` `/about`"
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 *أبو عباس - المساعدة*\n\n"
        "*يمكنني الإجابة عن:*\n"
        "• التوحيد وإبطال التثليث\n"
        "• عيسى عليه السلام في الإسلام\n"
        "• تحريف الكتاب المقدس\n"
        "• البشارات بمحمد ﷺ\n"
        "• الرد على شبهات النصارى\n"
        "• الصليب والفداء\n"
        "• النسخ في الشريعة\n"
        "• مقارنة الأديان\n\n"
        "*ملاحظة:* البوت أداة مساعدة وليس بديلاً عن طلب العلم عند العلماء."
    )

async def about(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤖 *عن أبو عباس*\n\n"
        "بوت ذكي يعمل بالذكاء الاصطناعي.\n"
        "قاعدته المعرفية من كتب كبار أئمة الإسلام:\n\n"
        "1️⃣ *الفصل في الملل والأهواء والنحل* - ابن حزم (804 صفحة)\n"
        "   أوسع كتاب في المقارنة بين الأديان\n\n"
        "2️⃣ *هداية الحيارى* - ابن القيم\n"
        "   في الرد على اليهود والنصارى\n\n"
        "3️⃣ *الجواب الصحيح* - ابن تيمية\n"
        "   الرد على من بدل دين المسيح\n\n"
        "4️⃣ *إظهار الحق* - رحمة الله الهندي\n"
        "   إبطال عقائد النصارى بالأدلة\n\n"
        "💡 *تنويه:* البوت يستنتج من هذه المصادر وليس ناقلاً حرفياً."
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """معالجة الرسائل مع البحث في قاعدة المعرفة"""
    try:
        question = update.message.text.strip()
        if not question:
            return
        
        await update.message.reply_chat_action("typing")
        q_norm = unicodedata.normalize("NFKC", question.lower())
        log.info(f"📩 سؤال: {question[:80]}")
        
        # المستوى 1: الأسئلة المحفوظة (فوري)
        for pattern, answer in ARABIC_COMMON_QA.items():
            if pattern in q_norm:
                await update.message.reply_text(answer)
                log.info(f"⚡ رد سريع")
                return
        
        # المستوى 2: البحث في قاعدة المعرفة
        kb_context = ""
        if CHUNKS:
            results = retrieve(question, VEC, MAT, CHUNKS, k=5, topic_index=TOPIC_INDEX)
            if results:
                kb_context = "\n\n".join([
                    f"[{r['source']} - ص{r['page']}]\n{r['text'][:500]}"
                    for r in results
                ])
                log.info(f"📚 وجد {len(results)} نتيجة في قاعدة المعرفة")
        
        # إشعار المستخدم أن البوت يعمل
        try:
            await update.message.reply_text("⏳ جاري البحث في المكتبة الإسلامية...")
        except:
            pass
        
        # المستوى 3: استدعاء API مع السياق إن وجد
        if kb_context:
            prompt = f"""المصادر المتاحة (أجب منها فقط ولا تستخدم معلومات من خارجها):
{kb_context}

سؤال المستخدم: {question}

⚠️ تعليمات صارمة:
1. أجب من المصادر أعلاه فقط — لا تستخدم أي معرفة خارجية من تدريبك
2. اذكر اسم المصدر ورقم الصفحة لكل استشهاد
3. إذا لم تجد الجواب في المصادر المقدمة، قل "لم أجد هذا في الكتب المرفوعة"
4. أجب بالعربية الفصحى بأسلوب العلماء"""
        else:
            prompt = f"""سؤال المستخدم: {question}

⚠️ تعليمات:
1. أنت عالم ملم بكل الكتب الإسلامية في مكتبتك — أجب من علمك بها
2. اذكر المصادر التي تستند إليها (اسم الكتاب، المؤلف)
3. إذا سئلت عن أمر لا تعرفه، قل صراحة "هذا لم يرد في الكتب التي أملكها"
4. أجب بالعربية الفصحى بأسلوب العلماء"""

        ai_response = await query_ai(prompt)
        
        if ai_response:
            await update.message.reply_text(ai_response)
            log.info(f"🧠 تم الرد")
        else:
            await update.message.reply_text(
                "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.\n"
                "💡 نصيحة: اطرح سؤالك بشكل أبسط."
            )
    
    except Exception as e:
        log.error(f"خطأ: {e}")
        try:
            await update.message.reply_text(
                "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            )
        except Exception:
            pass

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    log.error(f"Error: {context.error}")

def main():
    """تشغيل البوت مع إعادة تشغيل تلقائية عند أي خطأ"""
    restart_delay = 1
    while True:
        try:
            log.info("🚀 أبو عباس بوت عربي - بدء التشغيل...")
            # إنشاء event loop جديد لكل محاولة
            import asyncio
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            except:
                pass
            
            app = Application.builder().token(TOKEN).build()
            app.add_handler(CommandHandler("start", start))
            app.add_handler(CommandHandler("help", help_cmd))
            app.add_handler(CommandHandler("about", about))
            app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
            app.add_error_handler(error_handler)
            log.info("Polling...")
            app.run_polling(drop_pending_updates=True)
        except Exception as e:
            log.error(f"⚠️ خطأ في التشغيل: {e}")
        log.info(f"إعادة التشغيل بعد {restart_delay} ثانية...")
        time.sleep(restart_delay)
        restart_delay = min(restart_delay * 2, 30)

if __name__ == "__main__":
    main()
