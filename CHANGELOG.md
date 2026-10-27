# ImageSaw V1 (26/10/2026):
Initial build, proof of concept demo that converts images into individual slices of lines to be pasted into vertically aligned signs in GunSaw

# ImageSaw V2 (26/10/2026):
Improved baseline version. Will convert images into ASCII art utilizing PILLOW. Each "Pixel" gets a representative color after conversion. Current parameters include: Height, Width, Output

# ImageSaw V3 (26/10/2026):
Added support for transparent images by converting emtpy pixels into a color defined by an argument chosen by the user (--background). Additionally, optimizations were implemented to help with character count for signs to avoid crashing and frame drops.

# ImageSaw V4 (26/10/2026):
Implemented the --size argument, which will allow users to scale the image by however much they want without increasing resolution via --width and --height. This will allow users to trade clarity for size. Additionally, a bug fix was performed to fix images mirroring vertically when size was above 1.

# ImageSaw V5 (27/10/2026):
Implemented the --palette argument, which will allow users to restrict the amount of colors used in a converted image. Default is 16. Supported values are 1 to 256, or alternatively, unlimited (Not recommended). Additionally, a bug fix was performed to fix vertical squishing of the image.

# ImageSaw V6 (27/10/2026):
Implemented the Monochrome Edge Detection mode, usable with the --edges argument. When using --edges, you can omit --palette and --background. This mode will convert images into gray-scale pictures, then run an Edge Detection algorithm before using a different converter to create the image out of 2 individual symbols instead of a singular symbol with color arguments applied. This mode offers the BEST performance when it comes to optimization, but will also produce the worst looking images (Naturally to be expected. They are essentially black and white, with not much detail allowed). Additionally, a debug line was removed from the script.
