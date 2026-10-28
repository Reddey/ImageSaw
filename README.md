# ImageSaw
A tool used to convert images into ASCII art usable in the Info Boxes available in the Gunsaw Level Editor.

[Access the tool here!](https://reddey.github.io/ImageSaw/webapp/)

Relies on Python, Pillow, and tkinter. For now, not publicly released although it's coming soon!

Currently there are two modes available: 

Full Color mode. This allows you to add two or three high detail, full color pictures in near proximity of eachother.

Monochrome Edge-Detection (MCED). Uses an algorithm to detect edges in uploaded images, and converts the images into a much simpler, less demanding form of ASCII art usable in-game.

Notice: The size and line-height arguments are best left untouched! By default, they are configured to generate images at an aspect ratio of 1:1. If changed, you will need to manually calibrate them until the image looks right in-game! If you wish to increase the size of the image in-game, increase the image resolution up to AT MOST 120x120. Anything higher will severely affect performance.

[Keep track of progress in Issues at the to-do list.](https://github.com/Reddey/ImageSaw/issues/1)

# Development History

## Ingame example 1 (Full color, 40k Chars, 470fps stable) [ImageSaw v3]
![Ingame Example](https://github.com/user-attachments/assets/365299d9-2f01-416d-a5ef-487556461d2a)

## Ingame example 2 (Full color, multiple images, >150k Chars, 470fps Stable) [ImageSaw v3]
![Ingame Example](https://github.com/user-attachments/assets/7a303104-d5a9-446d-82bd-980892880cee)

## ImageSaw v5 Palette Functionality (Allows for aggressive optimization if so desired)
![Technical Screenie](https://github.com/user-attachments/assets/559bdded-c11f-401f-88b9-92cf517d75a9)

## ImageSaw v6 Monochrome Edge-Detection mode (Most aggressive optimization, worst image quality. The example in this picture weighed in at 5000 characters.)
![MCED Mode](https://github.com/user-attachments/assets/9038a6e2-9c79-41bb-bda1-ea490a490bdb)

## ImageSaw v7-6 Local GUI
![Graphical User Interface for ImageSaw v7-6](https://github.com/user-attachments/assets/2b8db5ca-290f-4c56-a1c1-5c7256e877fe)
ImageSaw v7-6 features a GUI for the localized program. Eventually post web-release I might release the local version with this GUI. For now this is what the Web-GUI will be based on.

## ImageSaw v8-7 Web App
![Web App for ImageSaw v8-7](https://github.com/user-attachments/assets/c9137e09-89ab-45df-af6c-cc8f60e9dd5b)
ImageSaw v8-7 in functionality is identical to v7-6. Both have the same relative backend, the main difference being the GUI. 7-6 is a standalone app you can run on your computer, while 8-7 is an online Web App that you can use without downloading any files. No files are uploaded, no files are stored, everything is done locally, so you can trust the images you upload are safely still in your hands.

## ImageSaw v8-7 Web App Released!
Enjoy! The tool is now publicly and freely available. As mentioned before, everything is ran locally through a web app, so nothing is ever uploaded to any server or online anywhere.
