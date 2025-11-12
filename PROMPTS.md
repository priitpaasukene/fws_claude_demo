# FWS Claude Code demo

FWS Claude demo  12.11.2025

/context

git commit iga sammu järel

# Prompts

## Algus - meil on tühi repositoorium (claudekit on paigaldatud kvaliteedi tõstmiseks.)

```
initalise empty project structure for browser only game with separate folders for tests, html and js.
  Write CLAUDE.md for the project listing common workflows.
```

Kataloogi Struktuur ja juhendid claude’le paigas. Teeme siis mängu  

## Mängu enda prompt

```
Please create simple browser game with following specfications:
* Linked URL's are relative.
* Game starts with screen displaying the rules:
   “””    this is chicken vs crocodiles game
   during your turn you can: 
   * place egg into empty cell
   * evolve egg into a chicken
   Computer takes his turn after your turn.
   * computer takes random legal action during his turn    “””
* under the rules text "start game" button is displayed. “ “start game” button starts the game when pressed
* After the game ends, player can reset the board and start new game
* all corner cases and exceptions are caught. debugging error is displayed when game is in unknown state and option to reset to initial state is available.

Rules of the game are following:
* player plays "team chicken"
* computer plays "team crocodile".
* computer takes random legal action during his turn.
* Game starts with empty 3x3 grid
* Players take turns. When players turn is over, turn goes to opponent
*  during his turn player can take one of following actions:
1) place egg in any free cell
  * if all cells are empty or contain chickens/crocodiles - this is the only legal turn player can take.
2a) evolve egg into chicken (for team chicken)
2b) evolve egg into crocodile (for team crocodile)
* player clicks on a cell to take his turn.
* after picking a cell, corresponding action is taken and turn goes to his opponent.
* if player clicks on empty cell - egg is placed in the cell and it's opponents turn
* if player clicks on a cell with egg in it - the egg is involved to chicken and it's opponents turn
* if player achieves 1 row, 1 column or 1 diagonal filled with his creatures - he is a winner
* after players turn is finished, there is 1 second delay before computers turn.
* computer plays random legal action
* if computer clicks on empty cell - egg is placed in the cell and it's opponents turn
* if computer clicks on a cell with egg in it - the egg is evolved to crocodile and it's opponent turn
* if computer achieves 1 row, 1 column or 1 diagonal filled with his creatures - he is a winner
* If one player wins or all cells contain chicken and crocodiles - no more turns are allowed
```

## Debugimine — kui vaja

<ei läinud vaja>

## Paneme arvuti kiiremini reageerima

Reduce the computers thinking time from 1 second to 100 milliseconds.

## Arvuti raskusastme valimine ? 
```
implement computer difficulty choosing
  when playing vs computer - have the dropdown with "random", "easy" and "hard" options that determines computers
  next move
  * random - make random legal move
  * easy - if next move wins - make it
  * hard - if it’s possible to win in 2 moves - make the first move from the set.
```

Kahe mängija mängu valik ?
```
please implement 2-player mode
  Replace "start game" button with 2 buttons - "play vs computer" and "hot seat play"
  * play vs computer mode acts as current game flow
  * "hot seat play" - 2 players - team chicken and team crocodile take turns
  * indicate on top of game board whose turn it is —
```

## Analüüs  —

Explain the computer difficulty settings implementation. What would be the improvements for difficulty setting?


please create tasklist from above findings and start implementing it.

## Context, tokenite kasutus demo ajal

```
> /context
  ⎿  ⛁ ⛀ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛀ ⛀
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   Context Usage
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   claude-sonnet-4-20250514 • 68k/200k tokens (34%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛶ ⛶ ⛶ ⛶
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ System prompt: 3.2k tokens (1.6%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ System tools: 13.4k tokens (6.7%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Custom agents: 454 tokens (0.2%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Memory files: 1.5k tokens (0.8%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Messages: 49.5k tokens (24.8%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛶ Free space: 131.9k (66.0%)

     Custom agents · /agents
     └ git-expert (Project): 75 tokens
     └ linting-expert (Project): 29 tokens
     └ code-review-expert (Project): 68 tokens
     └ testing-expert (Project): 72 tokens
     └ code-search (Project): 49 tokens
     └ css-styling-expert (Project): 95 tokens
     └ documentation-expert (Project): 66 tokens

     Memory files · /memory
     └ Project (/Users/priitp/fws_claude_demo/CLAUDE.md): 1.5k tokens

     SlashCommand Tool · 23 commands
     └ Total: 1.2k tokens
```
