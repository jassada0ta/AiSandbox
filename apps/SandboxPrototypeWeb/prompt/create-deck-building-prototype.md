Create prototype game that has following specifications.

- It use vanillajs+html+css 

- It self contained in one html file

- Save output into SandboxPrototype web

- save it in my-deck-building-proto.html

- Use Phaser4 as game engine as cdn

- Use bootstrap 5.3 for styling as cdn

- Game genre is Deck Building Card game

- Game will have 2 main modes
    - Overworld mode : this mode has following features.
        - This mode is initial mode when start game.
        - Player got initial 1000 hp. Display this as health bar on top left of screen.
        - Player can walk in the world like in Saga Frontier 2.
        - Player can control main character using mouse to click on tile. then main character walk to that tile.
        - On top right of screen display button to open Deck Building mode.
        - Overworld map use isometric tile to display.
        - Map size is 512×512 tile.
        - Player can talk to NPC in the world.
        - When start game it random spawn 20 enemy display as slime monster on the map.
        - Also it random spawn 10 NPC that user can talk to. When talk to NPC, heal player 100 hp or give random attack card with random strenght from 100 - 500.
        - Map tile compose of grassland and badland and water.
        - When player touch enemy, it change to card battle mode.
        - Initial cards in player library are as follow
            - 15 x Attack card with strengh 100
            - 10 x Defend card which can defend all attack
            - 5 x heal card which can heal 500 hp
    - Battle mode : this mode has following features.
        - This mode user interface is same as battle in Slay the Spire.
        - Basic game mechanic is same as Slay the Spire.
        - Enemy got initial 200 hp.
        - Each side have deck of 30 cards.
        - Enemy deck contain following cards
            - 20 x Attack card with strengh 50
            - 5 x Defend card which can defend all attack
            - 5 x heal card which can heal 50 hp
        - When player win go back to overworld mode and remove enemy from map.
        - When player lose, show game over screen.
    - Deck building mode : this mode has following features.
        - Player can browse all card in player library.
        - This mode player can move card in/out deck.
- When all enemies removed from overworld map. Show game end screen.
