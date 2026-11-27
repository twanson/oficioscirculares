#!/usr/bin/env python3
"""Comprime las fotos JPEG de un PDF (p. ej. los exportados desde Chromium).

Reduce cada imagen a una resolución efectiva máxima (por defecto 200 ppi según
el tamaño al que se pinta en la página) y la recodifica en JPEG. El texto y los
vectores no se tocan.

Uso:
    python3 scripts/comprimir-pdf.py ENTRADA.pdf SALIDA.pdf [--ppi 200] [--q 72]

Requiere pikepdf y Pillow (pip install pikepdf pillow).
"""
import argparse
import io

import pikepdf
from PIL import Image


def pintado_en_puntos(pdf):
    """Devuelve {objgen: (ancho_pt, alto_pt)} con el mayor tamaño al que se pinta cada imagen."""
    tam = {}
    for page in pdf.pages:
        res = page.get('/Resources', {})
        xobjs = res.get('/XObject', {}) if res else {}
        nombres = {str(k): v for k, v in xobjs.items()}
        ctm_stack = [[1, 0, 0, 1, 0, 0]]
        for operands, op in pikepdf.parse_content_stream(page):
            op = str(op)
            if op == 'q':
                ctm_stack.append(list(ctm_stack[-1]))
            elif op == 'Q' and len(ctm_stack) > 1:
                ctm_stack.pop()
            elif op == 'cm':
                a, b, c, d, e, f = [float(x) for x in operands]
                A, B, C, D, E, F = ctm_stack[-1]
                ctm_stack[-1] = [a * A + b * C, a * B + b * D, c * A + d * C, c * B + d * D,
                                 e * A + f * C + E, e * B + f * D + F]
            elif op == 'Do':
                xo = nombres.get(str(operands[0]))
                if xo is not None and xo.get('/Subtype') == '/Image':
                    m = ctm_stack[-1]
                    w = (m[0] ** 2 + m[1] ** 2) ** 0.5
                    h = (m[2] ** 2 + m[3] ** 2) ** 0.5
                    key = xo.objgen
                    pw, ph = tam.get(key, (0, 0))
                    tam[key] = (max(pw, w), max(ph, h))
    return tam


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada')
    ap.add_argument('salida')
    ap.add_argument('--ppi', type=int, default=200)
    ap.add_argument('--q', type=int, default=72)
    args = ap.parse_args()

    pdf = pikepdf.open(args.entrada)
    tam = pintado_en_puntos(pdf)
    hechas = 0
    for obj in pdf.objects:
        if not isinstance(obj, pikepdf.Stream) or obj.get('/Subtype') != '/Image':
            continue
        if obj.get('/Filter') != '/DCTDecode' or '/SMask' in obj:
            continue
        w, h = int(obj.Width), int(obj.Height)
        pw, ph = tam.get(obj.objgen, (w * 72 / args.ppi, h * 72 / args.ppi))
        if pw <= 0 or ph <= 0:
            continue
        escala = min(1.0, (pw / 72 * args.ppi) / w, (ph / 72 * args.ppi) / h)
        img = Image.open(io.BytesIO(obj.read_raw_bytes()))
        icc = img.info.get('icc_profile')
        if escala < 0.95:
            img = img.resize((max(1, round(w * escala)), max(1, round(h * escala))), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=args.q, optimize=True, progressive=False,
                 **({'icc_profile': icc} if icc else {}))
        datos = buf.getvalue()
        if len(datos) >= len(obj.read_raw_bytes()) and escala >= 0.95:
            continue
        obj.write(datos, filter=pikepdf.Name('/DCTDecode'))
        obj.Width, obj.Height = img.size
        if '/DecodeParms' in obj:
            del obj['/DecodeParms']
        hechas += 1
    pdf.remove_unreferenced_resources()
    pdf.save(args.salida, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    print(f'{hechas} imágenes recomprimidas -> {args.salida}')


if __name__ == '__main__':
    main()
