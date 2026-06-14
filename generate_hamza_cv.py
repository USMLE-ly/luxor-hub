#!/usr/bin/env python3
"""Hamza Albosify - Fully humanized, zero AI patterns, ATS-optimized."""

import os, re
from fpdf import FPDF, XPos, YPos

FONT_DIR = '/usr/share/fonts/truetype/liberation/'

class HamzaCV(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=True, margin=15)
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))
        self.add_font('Sans', 'BI', os.path.join(FONT_DIR, 'LiberationSans-BoldItalic.ttf'))
        self.teal = (21, 67, 71)
        self.dark = (43, 43, 43)
        self.gray = (120, 120, 120)

    def header(self):
        pass

    def draw_header(self):
        self.set_y(8)
        self.set_font('Sans', 'B', 20)
        self.set_text_color(*self.teal)
        self.cell(0, 9, 'HAMZA MOHAMED AL-BOSIFY', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', '', 9)
        self.set_text_color(*self.gray)
        self.cell(0, 5.5, 'Accounting Graduate  |  Restaurant & Cafe Operations Management',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Sans', 'I', 7)
        self.set_text_color(*self.gray)
        self.cell(0, 5, 'Benghazi, Libya  |  hamzaalbosify66@gmail.com  |  +218 92-7234826',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_draw_color(*self.teal)
        self.set_line_width(0.5)
        self.line(15, self.get_y() + 1.5, 195, self.get_y() + 1.5)
        self.set_y(self.get_y() + 4)

    def section(self, title):
        self.ln(1.5)
        self.set_font('Sans', 'B', 9)
        self.set_text_color(*self.teal)
        self.cell(0, 4.5, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*self.teal)
        self.set_line_width(0.35)
        self.line(15, self.get_y() + 0.3, 195, self.get_y() + 0.3)
        self.ln(1.5)
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
        old_l, old_r = self.l_margin, self.r_margin
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

    def bullet(self, text, keywords):
        old_l, old_r = self.l_margin, self.r_margin
        self.set_left_margin(22)
        self.set_right_margin(210 - 22 - 168)
        self.set_x(22)
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
        self.ln(4.5)

    def skills_row(self, category, items):
        self.set_x(18)
        self.set_font('Sans', 'B', 7.8)
        self.set_text_color(*self.teal)
        w_cat = self.get_string_width(category) + 1
        self.cell(w_cat, 3.8, category, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Sans', '', 7.8)
        self.set_text_color(*self.dark)
        self.multi_cell(174 - w_cat, 3.8, items)
        self.ln(0.2)


def generate(output_path):
    pdf = HamzaCV()
    pdf.add_page()
    pdf.draw_header()

    kw = [
        'financial accounting', 'financial reporting', 'inventory management',
        'cost control', 'budgeting', 'accounts payable', 'accounts receivable',
        'reconciliation', 'operational efficiency', 'supply chain',
        'vendor management', 'pos systems', 'microsoft excel',
        'team leadership', 'staff training', 'customer service',
        'quality control', 'fixing problems', 'decision-making',
        'operations management', 'cash flow', 'audit', 'profitability'
    ]

    # ===== PROFESSIONAL SUMMARY =====
    pdf.section('Professional Summary')
    pdf.write_body(
        "Fresh out of Benghazi University with an accounting degree. Spent the "
        "last year running restaurants in Benghazi. Not behind a desk. On the "
        "floor, with the team, checking the numbers at the end of every shift. "
        "I kept costs down, customers coming back, and the place from falling "
        "apart on busy nights. I like fixing problems. I like leading people. "
        "I speak Arabic and English. Looking for something real.",
        kw
    )

    # ===== EDUCATION =====
    pdf.section('Education')
    pdf.entry('Bachelor of Accounting', 'University of Benghazi  |  Faculty of Economics  |  2026')
    pdf.write_body(
        "Studied financial accounting, cost accounting, and auditing. I know "
        "budgeting, financial reporting, reconciliation. Read a lot of financial "
        "statements. The numbers tell a story if you know how to listen.",
        kw
    )

    # ===== WORK EXPERIENCE =====
    pdf.section('Work Experience')

    pdf.entry('Operations Manager / Supervisor', 'Al-Nakhla Al-Dhahabiya Establishments, Benghazi  |  2025')
    pdf.write_body(
        "I ran restaurants and cafes. Simple mission. Make sure everything "
        "works. Food on time. Customers happy. Team not losing it.",
        kw
    )
    pdf.bullet("Tracked every expense. Worked with finance to keep costs where they should be.", kw)
    pdf.bullet("Hired people. Trained them. Wrote the schedules. Made sure nobody wanted to quit.", kw)
    pdf.bullet("Customers had problems. I fixed them. Ran quality control checks every shift.", kw)
    pdf.bullet("Excel and POS systems. Every sale tracked. Every report on time.", kw)

    # ===== CERTIFICATES =====
    pdf.section('Certificates & Training')
    pdf.write_body(
        "Sofia Certified Credential in Business Administration and English. "
        "Successful Management and Effective Leadership Skills. "
        "Computer Skills and Office Productivity Applications.",
        kw
    )

    # ===== SKILLS =====
    pdf.section('Skills')

    pdf.skills_row('Accounting & Finance:', 'Financial accounting, reporting, cost control, budgeting, profitability analysis, reconciliation, inventory auditing, accounts payable, accounts receivable, cash flow management.')
    pdf.skills_row('Operations:', 'Restaurant and cafe management, operational efficiency, supply chain, vendor management, inventory management, quality control, POS systems.')
    pdf.skills_row('Leadership:', 'Team leadership, staff training and scheduling, customer service, conflict resolution, decision-making.')
    pdf.skills_row('Technical:', 'Microsoft Office Suite (Advanced Excel), Microsoft Excel, POS and billing systems, accounting software.')
    pdf.skills_row('Languages:', 'Arabic (Native)  |  English (Advanced - fluent spoken and written)')

    pdf.output(output_path)
    print(f'Generated: {output_path}')
    print(f'Pages: {pdf.pages_count}')

if __name__ == '__main__':
    import os
    out = '/root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free/Hamza_Albosify_CV.pdf'
    generate(out)
