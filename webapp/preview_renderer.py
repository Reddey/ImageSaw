#renderer for the webapp. Will build a preview window in the webapp that shows the user how the image will look like in-game ideally. COULD be done better but this works fine... for now.
from io import BytesIO
from PIL import Image, ImageOps, ImageFilter, ImageDraw


def render_preview(input_path, width=60, height=60, background='#000000',
                   palette=16, edges=False):
    with Image.open(input_path) as source:
        image = ImageOps.exif_transpose(source).convert('RGBA')
    backdrop = Image.new('RGBA', image.size, background)
    backdrop.alpha_composite(image)
    small = backdrop.convert('RGB').resize((width, height), Image.Resampling.BOX)

    #due to how the converter works, the converted image is mirrored vertically, the script fixes it for ingame, this section fixes it for the webapp.
    if edges:
        small = ImageOps.autocontrast(small.convert('L').filter(ImageFilter.FIND_EDGES))
    elif palette > 0:
        small = small.quantize(colors=palette, method=Image.Quantize.MEDIANCUT,
                               dither=Image.Dither.NONE).convert('RGB')

    #scale the p review so if the converted image is low "resolution", it will appear bigger in preview so ppl dont squint. God knows I already don't wear my glasses, this shit is just gonna make it worse for me. Its basically an accessibility feature lol
    cell = max(8, min(24, (320 + max(width, height) - 1) // max(width, height)))
    radius = max(2, round(cell / 4))
    dots = Image.new('RGB', (width * cell, height * cell), '#101010')
    draw = ImageDraw.Draw(dots)
    pixels = small.load()
    for y in range(height):
        for x in range(width):
            if edges:
                if pixels[x, y] <= 60:
                    continue
                color = '#f2f2f2'
            else:
                color = pixels[x, y]
            cx, cy = x * cell + cell // 2, y * cell + cell // 2
            draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

    output = BytesIO()
    dots.save(output, format='PNG')
    return output.getvalue()
