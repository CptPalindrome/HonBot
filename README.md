# HonBot

A discord bot with stupid functions

Created by CptPalindrome

---

## To start the bot

You will need to have node.js, then run 'node bot.js' once you have changed out the auth token for your own.

Feel free to fork this repo and modify it to your heart's content.

## Current Commands:

### [These all are precluded with 'h.']

### face

- Honbar will say the best emoji face in existence.

### dr

- Short for "don't read", this will post a link to a youtube video and frame it with a custom emoji from my server. If someone finds this and really wants it, let me know and I can hook you up. You might need to change the code for your new emoji id though.

### roulette

- Use this command and separate your roulette items with commas and it will randomly pick one from the list. The final result will be obvious when it's picked.

- Example: h.roulette item 1, item 2, item 3, ...

- Note, it will spend 3 seconds per item in the list at minimum, and up to another 15 seconds. Blame discord's rate limit for this one.

### cf

- Shorthand for "coin flip," this command is for whenever you can't decide on a binary choice, like whether McDonalds should be called McDoogles or MacDonlads.

### gandhi (#)

- Honbar spouts a *totally real* Gandhi quote.

- Optionally you can include a number after the word gandhi (i.e. h.gandhi 43) to select that quote. If it is outside the limit, either too low or too high, it will pull at random.

### chris

- Honbar puts out an *actually real* Fake Chris quote.

### 8ball

- Honbar will tell your fortune and answer your most burning yes no questions. Mostly just the second one.

### wyd (name)

- Honbar will tell you what the person you typed is up to or thinking. You can use an @ or just plaintext.

- If no name is provided, it will give you Honbar's inner thoughts.

- You may enter a number or secret phrase to select specific sentence templates. Example: h.wyd {#} Name of Person

### food/drink

- Honbar will serve you a delicious meal or beverage (depending on which you call).

- Put "mystery" and/or "group" (alt. "round") after the call to get some wilder results!

- For the food command, replace "mystery" with "plain" to remove sides and whatnot.

### acro

- Honbar will provide a series of letters ranging from 3-5 letters long.

- You enter words that match the pattern (as if an acronym) and then vote once the submission period is over. Who will win!?

### mad

- Honbar will sometimes be mad, but if he's not he will start a game of madlibs. Use h.j to join the game and provide some words!

### word example functions

- There's a few functions to print some example words from the madlibscomponents file, see the help command for this below to learn how to find all the functions.

### sugg

- Short for suggestion, this command allows you to enter a suggestion for whatever it may be, a command, a wyd template, a madlibs story, gandhi quote, you name it. Format your submission as TITLE | SUGGESTION and then send it in to get it added. The title is optional but recommended.

### banish

- Follow this command with an @ of a user or multiple users and it will add them to a list to have honbot ignore their commands. This is stored in memory and thus resets on device/honbot reboot. Unbanish command is the same but other way.

### unbanish

- Same as before but backwards.

### conversion

- Some simple unit conversions. Do 'help conversion' to see more or 'h.commands' for the full list of conversions supported.

### git

- Posts the link to the git repo for HonBot's amazing source code & well formulated readme notes. AKA this!

### help

- Lists all of these useful commands. Also just type help then a command name for a lot of different ones, I'm tired of adding individual ones here for no reason other than completeness. That said I'm also not removing the ones I've already done here.

### help gandhi

- Displays information about h.gandhi's functional purpose. It's pretty easy to figure out after literally one use, but whatever.

### help blackjack

- Displays all the blackjack associated functions. I'm not listing them all here.

### help food/drink

- Tells you a little extra about the food and drink commands. Not much though.

### help acro

- Tells you about the acro command.

### help mad/help madlibs

- Tells you the commands for madlibs. These are "pass" "votekick" and "j".

### help words

- Tells you the commands for the word example functions. Call this if you wanna know the list.

### help conversion

- Tells you more details for the different unit conversions. h.commands to get the full list.
