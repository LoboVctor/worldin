import fitz  # PyMuPDF
import sys

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    with open('pdf_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Extraction successful.")

if __name__ == "__main__":
    pdf_path = "c:\\Users\\Victor Lobo\\.gemini\\antigravity\\scratch\\worldin\\Documentação do Projeto - Worldin.pdf"
    extract_text(pdf_path)
