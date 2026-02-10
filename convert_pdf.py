import fitz  # PyMuPDF
import os

# Paths
pdf_path = r"g:\Chientest\thietke_01022026.pdf"
output_folder = r"g:\Chientest\design_images_v2"

# Create output folder if not exists
os.makedirs(output_folder, exist_ok=True)

# Open PDF and convert each page to PNG
doc = fitz.open(pdf_path)
print(f"PDF has {len(doc)} pages")

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    # Render page to an image with 2x zoom for better quality
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    output_path = os.path.join(output_folder, f"page_{page_num + 1:02d}.png")
    pix.save(output_path)
    print(f"Saved: {output_path}")

doc.close()
print("Done converting PDF to images!")
