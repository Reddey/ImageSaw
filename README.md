# ImageSaw
A tool used to convert images into ASCII art usable in the Info Boxes available in the Gunsaw Level Editor.

Relies on Python and Pillow. For now, not publicly released.

Currently there is only one mode available, Full Color mode. This allows you to add two or three high detail, full color pictures in near proximity of eachother.
A secondary mode, Edge-Detection Mono-Chrome is planned, which will use an algorithm to detect edges in uploaded images, and convert the images into a much simpler, less demanding form of ASCII art usable in-game.

Notice: Increasing Size will vertically mirror the image. This is a limitation from the way Info Boxes render text in Gunsaw, as such you may need to vertically mirror your image before conversion. I have figured out a solution for this issue so hopefully if implemented, it will work.

Ingame example (Full color, 40k Chars)
![Ingame Example](https://github.com/user-attachments/assets/365299d9-2f01-416d-a5ef-487556461d2a)
