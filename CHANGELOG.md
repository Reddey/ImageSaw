ImageSaw V1 (26/10/2026):
Initial build, proof of concept demo that converts images into individual slices of lines to be pasted into vertically aligned signs in GunSaw

ImageSaw V2 (26/10/2026):
Improved baseline version. Will convert images into ASCII art utilizing PILLOW. Each "Pixel" gets a representative color after conversion. Current parameters include: Height, Width, Output

ImageSaw V3 (26/10/2026):
Added support for transparent images by converting emtpy pixels into a color defined by an argument chosen by the user (--background). Additionally, optimizations were implemented to help with character count for signs to avoid crashing and frame drops.

ImageSaw V4 (26/10/2026):
Implemented the --size argument, which will allow users to scale the image by however much they want without increasing resolution via --width and --height. This will allow users to trade clarity for size. Additionally, a bug fix was performed to fix images mirroring vertically when size was above 1.

ImageSaw V5 (27/10/2026):
Implemented the --palette argument, which will allow users to restrict the amount of colors used in a converted image. Default is 16. Supported values are 1 to 256, or alternatively, unlimited (Not recommended). Additionally, a bug fix was performed to fix vertical squishing of the image.
