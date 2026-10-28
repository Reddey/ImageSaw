#import pillow. Man i wanna go to bed.
import argparse
import math
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
#define what dots to use when it comes to symbols
DOT = "●"
WDOT = "○"

#define default values for things the guy using this can change (hello guy snooping thru my code)
def image_to_dot_block(
    input_path,
    output_path,
    width=60,
    height=60,
    size=1.5,
    line_height=2.0,
    background="#000000",
    palette=16,
    edges=False,
):
    if not math.isfinite(size) or size <= 0:
        raise ValueError("Size must be a finite number greater than zero.")
    if not math.isfinite(line_height) or line_height <= 0:
        raise ValueError("Line height must be a finite number greater than zero.")

    #anti dummy warning for sizes.
    if width < 1 or height < 1:
        raise ValueError("Width and height must be at least 1.")

    #load the image and orient it correctly hopefully (Tends to fail, look over this when possible. Seems to be tied to size? Shit. Addendum: Tried fixing it, it doesn't work. Include a warning that changing size will sometimes rotate the image and require the user to modify the source image. :<)
    with Image.open(input_path) as source:
        image = ImageOps.exif_transpose(source).convert("RGBA")

    #anti dummy warning for background color.
    background = background.lstrip("#")
    if len(background) != 6:
        raise ValueError("Background must be a 6 digit hex color code.")

    try:
        bg_rgb = tuple(
            int(background[i:i + 2], 16)
            for i in (0, 2, 4)
        )
    except ValueError:
        raise ValueError("Invalid background hex color code.")

    #remove transparency from formats that support it and replace with the background color chosen.
    bg = Image.new("RGBA", image.size, (*bg_rgb, 255))
    image = Image.alpha_composite(bg, image).convert("RGB")

    #resample & resize pic to requested dimension
    resampling = getattr(Image, "Resampling", Image).BOX
    small = image.resize((width, height), resample=resampling)

    #apply vertical mirror.
    small = ImageOps.flip(small)

    #monochrome edge-detect mode. EXPERIMENTAL!!! heheheh just like the expies.
    if edges:
        gray = small.convert("L")
        gray = gray.filter(ImageFilter.FIND_EDGES)
        gray = ImageOps.autocontrast(gray)

        pixels = gray.load()
        rows = []

        for y in range(height - 1, -1, -1):
            row_parts = []

            for x in range(width):
                if pixels[x, y] > 60:
                    row_parts.append(DOT)
                else:
                    row_parts.append(WDOT)

            rows.append("".join(row_parts))

        content = "\n".join(rows)
        result = f"<line-height={line_height}><size={size}>{content}</size>"

        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result + "\n", encoding="utf-8")

        return
        #if anyone is rummaging through the code trying to optimize my sloppy coding, KEEP IN MIND THE RETURN IS IMPORTANT. Monochrome Edge-Detection Mode runs before Full Color mode if chosen, if not this section is skipped. Return will prevent FC mode from running afterwards. Trust me on this... hopefully.

    #apply palette limits
    if palette > 0:
        small = small.quantize(
            colors=palette,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        ).convert("RGB")
    #palette ant idummy warning
    if palette != 0 and not 1 <= palette <= 256:
        raise ValueError("Palette must range between 1 and 256, or alternatively, use 0 to disable limit.")

    pixels = small.load()

    #convert image to selected "Dot" symbol thingie and assign colors based on source image.
    rows = []

    for y in range(height - 1, -1, -1):
        row_parts = []
        previous_color = None

        for x in range(width):
            r, g, b = pixels[x, y]
            color = f"#{r:02X}{g:02X}{b:02X}"

            if color != previous_color:
                row_parts.append(f"<color={color}>")
                previous_color = color

            row_parts.append(DOT)

        rows.append("".join(row_parts))

    #append size arg and line height arg for whole text block
    content = "\n".join(rows)
    result = f"<line-height={line_height}><size={size}>{content}</size>"

    #save file
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(result + "\n", encoding="utf-8")

#argument parser
def main():
    parser = argparse.ArgumentParser(
        description="Convert an image into ASCII art usable in Gunsaw signs."
    )
    #cheie
    parser.add_argument("image", help="Input image path")
    parser.add_argument("--width", type=int, default=60, help="Determines horizontal resolution of the image. Will affect aspect ratio too. DOES NOT AFFECT SIZE!")
    parser.add_argument("--height", type=int, default=60, help="Determines vertical resolution of the image. Will affect aspect ratio too. DOES NOT AFFECT SIZE!")
    parser.add_argument("--size", type=float, default=1.5, help="Determines the scale of the image in-game. Higher size, higher scale. DOES NOT AFFECT RESOLUTION!")
    parser.add_argument("--line-height", type=float, default=2.0, help="Controls in-game vertical text spacing. Adjust manually if the image appears distorted.")
    parser.add_argument("--output", default="sign.txt", help="Determines the name of the output file.")
    parser.add_argument("--background", default="#000000", help="Determines what color background to use for transparent images. Use a color hex code.")
    parser.add_argument("--palette", type=int, default=16, help="Determines number of maximum colors in the image. Ranges from 1 to 256, use 0 to disable limit. Will significantly help with performance.")
    parser.add_argument("--edges", action="store_true", help="Will switch the tool into Monochrome Edge Detect mode, converting images into black and white, two symbol ASCII art. Best performance, worst visuals.")

    args = parser.parse_args()
    #definire argumente
    try:
        image_to_dot_block(
            input_path=args.image,
            output_path=args.output,
            width=args.width,
            height=args.height,
            size=args.size,
            line_height=args.line_height,
            background=args.background,
            palette=args.palette,
            edges=args.edges,
        )
    except (OSError, ValueError) as error:
        parser.error(str(error))
    #rezultat
    print(
        f"Converted image to {args.width}x{args.height} dots. "
        f"Saved to: {args.output}"
    )

#end
if __name__ == "__main__":
    main()