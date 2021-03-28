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

### say

- Honbar will say whatever it is you type after "say" and delete your message for you. He's talking! You can add /tts at the beginning and have him use tts in his message. Powerful!

### dr

- Short for "don't read", this will post a link to a youtube video and frame it with a custom emoji from my server. If someone finds this and really wants it, let me know and I can hook you up. You might need to change the code for your new emoji id though.

### roulette

- Use this command and separate your roulette items with commas and it will randomly pick one from the list. The final result will be obvious when it's picked.

- Example: h.roulette item 1, item 2, item 3, ...

- Note, it will spend 3 seconds per item in the list at minimum, and up to another 15 seconds. Blame discord's rate limit for this one.

### cf

- Shorthand for "coin flip," this command is for whenever you can't decide on a binary choice, like whether McDonalds should be called McDoogles or MacDonlads.

### cfsim

- Similarly, this is "coin flip simulation". This will run a bunch of coin flip trials (up to 10,000).

- If no parameter is entered after the command (i.e. h.cfsim 3000), it will simply default to 100 trials. Don't use commas in your numbers. It won't work.

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

### git

- Posts the link to the git repo for HonBot's amazing source code & well formulated readme notes. AKA this!

### help

- Lists all of these useful commands

### help gandhi

- Displays information about h.gandhi's functional purpose. It's pretty easy to figure out after literally one use, but whatever.

### help blackjack

- Displays all the blackjack associated functions. I'm not listing them all here.

### help food/drink

- Tells you a little extra about the food and drink commands. Not much though.
