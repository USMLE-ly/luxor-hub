#!/usr/bin/env python3
import os, re
from fpdf import FPDF, XPos, YPos

FONT_DIR = '/usr/share/fonts/truetype/liberation/'

class ProCV(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=True, margin=15)
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))
        self.add_font('Sans', 'BI', os.path.join(FONT_DIR, 'LiberationSans-BoldItalic.ttf'))
        self.navy = (27, 42, 74)
        self.dark = (43, 43, 43)
        self.gray = (120, 120, 120)
        self.white = (255, 255, 255)
        self.link_target = 'https://coursera.org/verify/professional-cert/6OMZYLOHUHK2'

    def header(self):
        pass

    def draw_full_header(self):
        self.set_y(8)
        self.set_font('Sans', 'B', 21)
        self.set_text_color(*self.navy)
        self.cell(0, 9, 'ABRAHAM MOHAMMED ALBOSIFY', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', '', 8.5)
        self.set_text_color(*self.gray)
        self.cell(0, 5.5, 'Medical Doctor  |  UX Designer  |  Educator  |  Cross-Cultural Facilitator',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', 'I', 7)
        self.set_text_color(*self.gray)
        self.cell(0, 5, 'Benghazi, Libya  |  Arabic (Native)  |  English (Advanced)  |  German (A2/B1)',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_draw_color(*self.navy)
        self.set_line_width(0.5)
        self.line(15, self.get_y() + 1.5, 195, self.get_y() + 1.5)
        self.set_y(self.get_y() + 4)

    def section(self, title):
        self.ln(1.8)
        self.set_font('Sans', 'B', 9)
        self.set_text_color(*self.navy)
        self.cell(0, 4.5, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*self.navy)
        self.set_line_width(0.35)
        self.line(15, self.get_y() + 0.3, 195, self.get_y() + 0.3)
        self.ln(1.8)
        self.set_text_color(*self.dark)

    def entry(self, title, sub=''):
        self.set_x(18)
        self.set_font('Sans', 'B', 8.5)
        self.set_text_color(*self.dark)
        self.cell(0, 4.5, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        if sub:
            self.set_x(18)
            self.set_font('Sans', 'I', 7)
            self.set_text_color(*self.gray)
            self.cell(0, 3.5, sub, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_text_color(*self.dark)

    def write_body(self, text, keywords):
        old_l = self.l_margin
        old_r = self.r_margin
        self.set_left_margin(18)
        self.set_right_margin(210 - 18 - 174)
        self.set_x(18)
        self.set_font('Sans', '', 7.8)
        self.set_text_color(*self.dark)
        escaped = [re.escape(kw) for kw in sorted(keywords, key=len, reverse=True)]
        pattern = '(' + '|'.join(escaped) + ')'
        parts = re.split(pattern, text, flags=re.IGNORECASE)
        for part in parts:
            is_kw = any(kw.lower() == part.lower() for kw in keywords)
            self.set_font('Sans', 'B' if is_kw else '', 7.8)
            self.set_text_color(*self.dark)
            self.write(3.8, part)
        self.set_left_margin(old_l)
        self.set_right_margin(old_r)
        self.ln(4.2)
        self.ln(0.1)

    def skills_row(self, category, items):
        self.set_x(18)
        self.set_font('Sans', 'B', 7.8)
        self.set_text_color(*self.navy)
        w_cat = self.get_string_width(category) + 1
        self.cell(w_cat, 3.8, category, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Sans', '', 7.8)
        self.set_text_color(*self.dark)
        self.cell(174 - w_cat, 3.8, items, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(0.2)

    def write_vol(self, title, desc, keywords):
        self.set_x(18)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*self.dark)
        self.cell(0, 3.8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        old_l = self.l_margin
        old_r = self.r_margin
        self.set_left_margin(18)
        self.set_right_margin(210 - 18 - 174)
        self.set_x(18)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(*self.dark)
        escaped = [re.escape(kw) for kw in sorted(keywords, key=len, reverse=True)]
        pattern = '(' + '|'.join(escaped) + ')'
        parts = re.split(pattern, desc, flags=re.IGNORECASE)
        for part in parts:
            is_kw = any(kw.lower() == part.lower() for kw in keywords)
            self.set_font('Sans', 'B' if is_kw else '', 7.5)
            self.set_text_color(*self.dark)
            self.write(3.5, part)
        self.set_left_margin(old_l)
        self.set_right_margin(old_r)
        self.ln(4)
        self.ln(0.1)


def generate(output_path):
    pdf = ProCV()
    pdf.add_page()
    pdf.draw_full_header()

    kw = [
        'diagnosis', 'patient care', 'emergency medicine', 'clinical research',
        'interdisciplinary collaboration', 'treatment planning',
        'user research', 'wireframing', 'prototyping', 'Figma', 'usability testing',
        'interaction design', 'information architecture',
        'lesson planning', 'curriculum development', 'classroom management',
        'branding', 'visual communication', 'typography', 'Adobe Creative Suite',
        'empathy', 'conflict resolution', 'active listening', 'cross-cultural',
        'patient-centered', 'clinical decision-making', 'storytelling',
        'intercultural', 'global citizenship', 'teamwork'
    ]

    # ===== PROFESSIONAL SUMMARY =====
    pdf.section('Professional Summary')
    pdf.write_body(
        "A doctor who actually loves the job. That is me. Outside the hospital "
        "I picked up a Google UX Design Certificate. I do user research, teach "
        "English, and help people talk across cultures through Soliya. My best "
        "days are with elderly folks who just want company. Or teaching kids. "
        "Or sitting in a circle with strangers from different countries talking "
        "about the hard stuff. Arabic, English, and German are my languages. "
        "Still figuring things out. But I show up.",
        kw
    )

    # ===== EDUCATION =====
    pdf.section('Education')

    pdf.entry('Bachelor of Medicine', 'University of Benghazi  |  Expected June 2027')
    pdf.write_body(
        "Six years of medical school. The real lessons happened in the hospital "
        "during rotations. Long nights. Tough calls. Nurses who taught me more "
        "than any textbook. I learned to keep my head when everything went wrong "
        "at once. And to trust the people next to me.",
        kw
    )

    # Google UX Design Professional Certificate
    pdf.set_x(18)
    pdf.set_font('Sans', 'B', 8.5)
    pdf.set_text_color(*pdf.dark)
    pdf.cell(0, 4.5, 'Google UX Design Professional Certificate', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(18)
    pdf.set_font('Sans', 'I', 7)
    pdf.set_text_color(*pdf.gray)
    pdf.write(3.5, 'Offered by ')
    google_colors = [(66, 133, 244), (234, 67, 53), (251, 188, 4), (66, 133, 244), (52, 168, 83), (234, 67, 53)]
    for i, ch in enumerate('Google'):
        pdf.set_text_color(*google_colors[i])
        pdf.write(3.5, ch, pdf.link_target)
    pdf.set_text_color(*pdf.gray)
    pdf.write(3.5, ' via Coursera')
    pdf.ln(4.5)

    courses = [
        ('Foundations of User Experience (UX) Design', 'GFU4WR0LWN9D'),
        ('Start the UX Design Process: Empathize, Define & Ideate', 'CPNZ4778S27Q'),
        ('Build Wireframes & Low-Fidelity Prototypes', 'BM81ZCT6VKQL'),
        ('Conduct UX Research & Test Early Concepts', 'R5LP730C04M1'),
        ('Create High-Fidelity Designs & Prototypes in Figma', 'BOP84AQRTNLD'),
        ('Build Dynamic User Interfaces (UI) for Websites', '9MHCWIIB2X7P'),
        ('Design for Social Good & Prepare for Jobs', '4SHEQFH9CRQH'),
        ('Accelerate Your Job Search with AI', 'NM24A5RORD77'),
    ]
    pdf.set_font('Sans', '', 7)
    for name, cid in courses:
        url = f'https://coursera.org/verify/{cid}'
        pdf.set_text_color(*pdf.dark)
        pdf.set_x(20)
        pdf.cell(160, 3.3, name, new_x=XPos.LMARGIN, new_y=YPos.NEXT, link=url)
    pdf.ln(0.5)

    # ===== WORK EXPERIENCE =====
    pdf.section('Work Experience')

    pdf.entry('Medical Doctor', 'Hospital  |  Jan 2024 - Present')
    pdf.write_body(
        "I see patients every day. Some days the ER is chaos. Other days it is "
        "quiet and I get to sit with someone and really listen. Teamwork keeps "
        "us going. When things get bad we hold it together for each other. "
        "The pressure teaches you to focus. And to be kind even when you are "
        "exhausted.",
        kw
    )

    pdf.entry('English Teacher', 'Elementary School  |  Sep 2023 - Present')
    pdf.write_body(
        "Teaching kids English is the highlight of my week. No joke. I show up "
        "with stories and games and maybe too much energy. When a child finally "
        "says a word they struggled with and their whole face lights up. That is "
        "why I do it. Every kid learns differently so I try to meet them where "
        "they are.",
        kw
    )

    pdf.entry('Cross-Cultural Facilitator', 'Soliya  |  Jun 2023 - Present')
    pdf.write_body(
        "Soliya changed me. I facilitate conversations between young people from "
        "different countries. Not small talk. The kind where you talk about what "
        "actually divides you. I learned active listening. I learned to shut up "
        "and really hear people. To sit with discomfort instead of running. To "
        "guide without pushing. Hardest thing I have done. Also the most important.",
        kw
    )

    pdf.entry('Graphic Designer', 'Freelance / Volunteer  |  Jan 2022 - Present')
    pdf.write_body(
        "I make stuff for nonprofits. Logos, posters, social media graphics. "
        "Whatever moves their mission forward. I use Figma and Adobe tools. "
        "But the real challenge is never the software. It is telling their story "
        "in a way that makes people stop scrolling and actually pay attention.",
        kw
    )

    # ===== VOLUNTEER EXPERIENCE =====
    pdf.section('Volunteer Experience')

    pdf.write_vol('Hospital Volunteer',
        "I help however I can. Sometimes I grab supplies. Sometimes I just sit "
        "with a scared patient. I learned that showing up matters more than "
        "having the right words.", kw)
    pdf.write_vol('Campus Volunteer & Community Outreach',
        "I organize events and mentor students. Not flashy work. But it makes "
        "campus feel like home for people far from theirs.", kw)
    pdf.write_vol('Elderly Care Volunteer',
        "I visit elderly people who do not get visitors. I bring tea. I listen "
        "to their stories. Some of my best conversations happened in a quiet "
        "room with someone twice my age.", kw)
    pdf.write_vol('Soliya Facilitator',
        "I help young people from different backgrounds talk about real things. "
        "Not the safe version. The kind where you risk messing up. Watching "
        "them find common ground. That is the good stuff.", kw)

    # ===== SKILLS =====
    pdf.section('Skills')

    pdf.skills_row('Medical & Clinical:', 'Diagnosis, patient care, emergency medicine, clinical research, interdisciplinary collaboration, treatment planning.')
    pdf.skills_row('UX Design & Research:', 'User research, wireframing, prototyping (Figma), usability testing, interaction design, information architecture.')
    pdf.skills_row('Teaching & Education:', 'Lesson planning, curriculum development, English instruction, classroom management, child education, assessment design.')
    pdf.skills_row('Design & Media:', 'Branding, visual communication, digital media, typography, Adobe Creative Suite, visual storytelling.')
    pdf.skills_row('Languages:', 'Arabic (Native)  |  English (Advanced)  |  German (A2/B1)')
    pdf.skills_row('Core Strengths:', 'Cross-cultural communication, conflict resolution, public speaking, team leadership, adaptability, critical thinking, empathy.')

    pdf.output(output_path)
    print(f'Generated: {output_path}')
    print(f'Pages: {pdf.pages_count}')
    print(f'Size: {os.path.getsize(output_path)} bytes')

if __name__ == '__main__':
    import os
    out = '/root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free/Abraham_Albosify_CV.pdf'
    generate(out)
