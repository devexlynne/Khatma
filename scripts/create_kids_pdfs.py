from pathlib import Path

base = Path(__file__).resolve().parent.parent / 'public'
base.mkdir(parents=True, exist_ok=True)
for i, name in enumerate(['حديقة الأطفال 1', 'حديقة الأطفال 2'], start=1):
    path = base / f'kids-garden-{i}.pdf'
    text = f'Kids Garden {i} - {name}'
    content = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length " + str(len(text) + 57).encode('ascii') + b" >>\nstream\nBT /F1 24 Tf 50 700 Td (" + text.encode('ascii', 'replace') + b") Tj ET\nendstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"0000000010 00000 n \n0000000053 00000 n \n0000000103 00000 n \n"
        b"0000000201 00000 n \n0000000269 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n337\n%%EOF\n"
    )
    path.write_bytes(content)
    print(f'Wrote {path}')
