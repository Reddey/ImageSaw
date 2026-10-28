# ImageSaw
A tool used to convert images into ASCII art usable in the Info Boxes available in the Gunsaw Level Editor.

Relies on Python and Pillow. For now, not publicly released.

Currently there is only one mode available, Full Color mode. This allows you to add two or three high detail, full color pictures in near proximity of eachother.
A secondary mode, Edge-Detection Mono-Chrome is planned, which will use an algorithm to detect edges in uploaded images, and convert the images into a much simpler, less demanding form of ASCII art usable in-game.

Notice: Increasing Size will vertically mirror the image. This is a limitation from the way Info Boxes render text in Gunsaw, as such you may need to vertically mirror your image before conversion. I have figured out a solution for this issue so hopefully if implemented, it will work.

[Keep track of progress in Issues at the to-do list.](https://github.com/Reddey/ImageSaw/issues/1)

Ingame example 1 (Full color, 40k Chars, 470fps stable)
![Ingame Example](https://github.com/user-attachments/assets/365299d9-2f01-416d-a5ef-487556461d2a)

Ingame example 2 (Full color, multiple images, >150k Chars, 470fps Stable)
![Ingame Example](https://github.com/user-attachments/assets/7a303104-d5a9-446d-82bd-980892880cee)

ImageSaw v5 Palette Functionality (Allows for aggressive optimization if so desired)
![Technical Screenie](https://github.com/user-attachments/assets/559bdded-c11f-401f-88b9-92cf517d75a9)

ImageSaw v6 Monochrome Edge-Detection mode (Most aggressive optimization, worst image quality. The example in this picture weighed in at 5000 characters.)
![MCED Mode](https://github.com/user-attachments/assets/9038a6e2-9c79-41bb-bda1-ea490a490bdb)

ImageSaw v7-6 GUI
![Graphical User Interface for ImageSaw v7-6]("https://github.com/user-attachments/assets/2b8db5ca-290f-4c56-a1c1-5c7256e877fe")
