#!/usr/bin/env python3
"""
Professional CV Generator v4 - Abraham Mohammed Albosify
Dark navy header (page 1 only), clean modern template,
aligned certs, organized skills, humanized content, German A2/B1.
No blank pages.
"""

import os
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
        self.link_blue = (30, 90, 180)

    def header(self):
        """No auto-header. We draw manually."""
        pass

    def draw_full_header(self):
        self.set_fill_color(*self.navy)
        self.rect(0, 0, 210, 34, 'F')
        self.set_y(5)
        self.set_font('Sans', 'B', 21)
        self.set_text_color(*self.white)
        self.cell(0, 9, 'ABRAHAM MOHAMMED ALBOSIFY', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', '', 8.5)
        self.set_text_color(180, 195, 220)
        self.cell(0, 5.5, 'Medical Doctor  |  UX Designer  |  Educator  |  Cross-Cultural Facilitator',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', 'I', 7)
        self.set_text_color(160, 175, 200)
        self.cell(0, 5, 'Benghazi, Libya  |  Arabic (Native)  |  English (Advanced)  |  German (A2/B1)',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_y(38)

    def page_break_or_space(self, needed_mm=20):
        """Check if we need a page break, if so draw thin rule."""
        if self.get_y() + needed_mm > 297 - 15:
            self._draw_page_rule()
            self.add_page()
            self._draw_page_rule()
            return True
        return False

    def _draw_page_rule(self):
        self.set_fill_color(*self.navy)
        self.rect(0, 0, 210, 1.2, 'F')

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

    def body(self, text):
        self.set_x(18)
        self.set_font('Sans', '', 7.8)
        self.set_text_color(*self.dark)
        self.multi_cell(174, 3.8, text)
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

    def vol_entry(self, title, desc):
        self.set_x(18)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*self.dark)
        self.cell(0, 3.8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_x(18)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(*self.dark)
        self.multi_cell(174, 3.5, desc)
        self.ln(0.1)


def generate(output_path):
    pdf = ProCV()
    pdf.add_page()
    pdf.draw_full_header()

    # ===== PROFESSIONAL SUMMARY =====
    pdf.section('Professional Summary')
    pdf.body(
        'I am a medical doctor with a deep passion for helping people and making a '
        'difference. Alongside my clinical work, I hold a Google UX Design Professional '
        'Certificate and bring experience in user research, interaction design, and '
        'cross-cultural facilitation. I believe in treating the whole person, not just '
        'the symptoms, and I carry that empathy into every role I take on. Whether '
        'teaching English to young children, volunteering with the elderly, or '
        'facilitating intercultural dialogues through Soliya, my goal is always to '
        'connect, understand, and serve. I speak Arabic, English, and German, and '
        'I am committed to growing as both a professional and a human being.'
    )

    # ===== EDUCATION =====
    pdf.section('Education')

    pdf.entry('Bachelor of Medicine', 'University of Benghazi  |  Expected June 2027')
    pdf.body(
        'Six-year medical program with rigorous training in diagnosis, patient care, '
        'clinical decision-making, and emergency medicine. Through clinical rotations '
        'and hands-on hospital practice, I developed strong analytical thinking, '
        'resilience under pressure, and the ability to work effectively within '
        'interdisciplinary medical teams.'
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
    pdf.set_text_color(*pdf.link_blue)
    pdf.write(3.5, 'Google', 'https://coursera.org/verify/professional-cert/6OMZYLOHUHK2')
    pdf.set_text_color(*pdf.gray)
    pdf.write(3.5, ' via Coursera')
    pdf.ln(4)

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
    pdf.set_x(18)
    pdf.set_font('Sans', '', 7)
    for name, cid in courses:
        url = f'https://coursera.org/verify/{cid}'
        pdf.set_text_color(*pdf.link_blue)
        pdf.cell(0, 3.3, f'  \u2022  {name}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, link=url)
    pdf.set_text_color(*pdf.dark)
    pdf.ln(0.8)

    # ===== WORK EXPERIENCE =====
    pdf.section('Work Experience')

    pdf.entry('Medical Doctor', 'Hospital  |  Jan 2024 - Present')
    pdf.body(
        'I provide comprehensive medical care with a focus on empathy and precision. '
        'My daily work involves diagnosing and treating patients, managing emergencies, '
        'monitoring recovery, and collaborating closely with interdisciplinary teams '
        'to ensure patient-centered outcomes. Working under pressure has strengthened '
        'my clinical decision-making and deepened my commitment to compassionate care.'
    )

    pdf.entry('English Teacher', 'Elementary School  |  Sep 2023 - Present')
    pdf.body(
        'Teaching English to young children has been one of my most rewarding '
        'experiences. I design interactive lessons using storytelling, games, and '
        'creative activities to build confidence and foundational literacy. Seeing '
        'a child\'s eyes light up when they understand something new is why I love '
        'being an educator. I also develop curriculum and assessment strategies '
        'tailored to different learning styles.'
    )

    pdf.entry('Cross-Cultural Facilitator', 'Soliya  |  Jun 2023 - Present')
    pdf.body(
        'Through Soliya, I facilitate structured conversations between young people '
        'from different countries and cultures. These dialogues build empathy, break '
        'down stereotypes, and promote global citizenship. I have developed strong '
        'skills in conflict resolution, active listening, and group facilitation, '
        'and have seen firsthand how open conversation can bridge even the widest '
        'cultural divides.'
    )

    pdf.entry('Graphic Designer', 'Freelance / Volunteer  |  Jan 2022 - Present')
    pdf.body(
        'I create visual content for nonprofits and community organizations, using '
        'design to support social causes. My work includes branding, digital media, '
        'and visual storytelling. I am proficient in Figma and Adobe Creative Suite, '
        'and I enjoy combining creativity with purpose to make complex ideas clear.'
    )

    # ===== VOLUNTEER EXPERIENCE =====
    pdf.section('Volunteer Experience')

    pdf.vol_entry('Hospital Volunteer',
        'Support patients and medical staff with direct assistance and emotional '
        'care. Learned patience, active listening, and the importance of being '
        'present for someone in need.')
    pdf.vol_entry('Campus Volunteer & Community Outreach',
        'Lead university initiatives and student support programs. Organize events, '
        'mentor fellow students, and build a stronger campus community.')
    pdf.vol_entry('Elderly Care Volunteer',
        'Spend time with elderly individuals, assisting with daily needs and '
        'offering companionship. Cultivated compassion, patience, and deep respect '
        'for the wisdom that comes with age.')
    pdf.vol_entry('Soliya Facilitator',
        'Connect young people across cultures through facilitated dialogue programs. '
        'Help participants discover common ground and build mutual understanding '
        'across cultural divides.')

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
    print(f'Size: {os.path.getsize(output_path)} bytes')
    print(f'Pages: {pdf.pages_count}')

if __name__ == '__main__':
    out = '/root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free/Abraham_Albosify_CV.pdf'
    generate(out)
