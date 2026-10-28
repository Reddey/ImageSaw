# ImageSaw
A tool used to convert images into ASCII art usable in the Info Boxes available in the Gunsaw Level Editor.

Relies on Python, Pillow, and tkinter. For now, not publicly released although it's coming soon!

Currently there are two modes available: 

Full Color mode. This allows you to add two or three high detail, full color pictures in near proximity of eachother.

Monochrome Edge-Detection (MCED). Uses an algorithm to detect edges in uploaded images, and converts the images into a much simpler, less demanding form of ASCII art usable in-game.

Notice: The size and line-height arguments are best left untouched! By default, they are configured to generate images at an aspect ratio of 1:1. If changed, you will need to manually calibrate them until the image looks right in-game! If you wish to increase the size of the image in-game, increase the image resolution up to AT MOST 120x120. Anything higher will severely affect performance.

[Keep track of progress in Issues at the to-do list.](https://github.com/Reddey/ImageSaw/issues/1)

Ingame example 1 (Full color, 40k Chars, 470fps stable)
![Ingame Example](https://github.com/user-attachments/assets/365299d9-2f01-416d-a5ef-487556461d2a)

Ingame example 2 (Full color, multiple images, >150k Chars, 470fps Stable)
![Ingame Example](https://github.com/user-attachments/assets/7a303104-d5a9-446d-82bd-980892880cee)

ImageSaw v5 Palette Functionality (Allows for aggressive optimization if so desired)
![Technical Screenie](https://github.com/user-attachments/assets/559bdded-c11f-401f-88b9-92cf517d75a9)

ImageSaw v6 Monochrome Edge-Detection mode (Most aggressive optimization, worst image quality. The example in this picture weighed in at 5000 characters.)
![MCED Mode](https://github.com/user-attachments/assets/9038a6e2-9c79-41bb-bda1-ea490a490bdb)

ImageSaw v7-6 Local GUI
![Graphical User Interface for ImageSaw v7-6](https://github.com/user-attachments/assets/2b8db5ca-290f-4c56-a1c1-5c7256e877fe)
ImageSaw v7-6 features a GUI for the localized program. Eventually post web-release I might release the local version with this GUI. For now this is what the Web-GUI will be based on.
