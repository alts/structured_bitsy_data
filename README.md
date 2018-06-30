[Bitsy](https://ledoux.itch.io/bitsy) is a wonderful game creation tool. It has
a plaintext data format that presumably was meant for hand editing at one point.

I wanted to make a game with a _lot_ of rooms, and I thought it'd be easier to
write something that generated the game data from some initial room templates.
That required a way of interacting with, and editing, rooms in a structured way.
Thus, parsing and serializing game data like this.
