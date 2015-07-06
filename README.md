# WebQuake

**WebQuake** is an HTML5 WebGL port of the game Quake by id Software.

[Online demo by SpiritQuaddicted](http://quaddicted.com/forum/viewtopic.php?pid=438).

# Mac Prerequites

1. Get the [Shareware version of Quake data files](http://www.quakeone.com/q1files/downloads/mac/Quake106SW_DATA.sit).
2. The data files are in [StuffIt](https://itunes.apple.com/us/app/stuffit-expander/id405580712?mt=12) format. Download and install (it's free).

# Running the client

Follow these steps to run the WebQuake client:

1. Install the data files `id1` folder to `Web/public/id1`. 
2. If you have Quake mission packs, repeat step 4 for `hipnotic` and/or `rogue` folders.
1. If you're running a system with case-sensitive names (such as Linux), make sure that all game files **except for code files** have lowercase names.

Launch the server:

```sh-session
$ cd Web
$ npm install
$ node web.js -p 3001
To play Quake, go to http://localhost:3001
```

To launch the game with command line arguments, add ? after the address and put the arguments after it in the same format as you use for Quake.

For Scourge of Armagon, add `-hipnotic` command line argument. For Dissolution of Eternity, add `-rogue`.

To launch mods, copy the mod folder into the `public` folder and add `-game MOD_NAME_HERE` command line argument. 

To use browser hotkeys (such as F5, Ctrl+T and Ctrl+W), click the address bar, and when you're done, click the game.

# Playing multiplayer

If you want to join a multiplayer game, do one of the following steps, go to Multiplayer menu in the main menu, type the IP in "Join game at" field and press Enter, or type `connect ws://ip:port` in the console.

You can also play WebQuake games in a native Quake (not QuakeWorld) client such as WinQuake or GLQuake. Choose TCP/IP in the Join Game menu.

You cannot join multiplayer games if the client is installed on https:// protocol, however.

If you want to create a server, first, install the dedicated server by completing the following steps.

## General Procedure

1. `cd Server`
1. Copy Quake resource files into the `id1` directory.
1. Run `npm install`.
1. Load the Conjur policy:

```sh-session
$ conjur policy load -c policy-sandbox.json policy.rb
$ account=$(ruby -ryaml -e "puts YAML.load(File.read(File.expand_path('~/accounts/kegdev/.conjurrc')))['account']")
$ policy=$(cat policy-sandbox.json | jsonfield policy)
```

Launch the server:

```sh-session
$ CONJUR_CERT=~/conjur-$account.pem \
	CONJUR_URL="https://kegdev.conjur.itd.conjur.net/api/authz/$account/resources/webservice/$policy/quake2-1.0/server" \
	node WebQDS -port 20001
```

To change maximum number of players, use `-maxplayers` command line argument.

## Remote console

To perform `rcon` (Remote Control) commands from the web client, the traffic needs to be directed through the Authorization proxy. `rcon_password` has been removed since it's insecure.

You have several ways to execute server commands:

* In the game, when not connected, in the console, type `rcon_address ip:port` (without ws://), and then execute the commands by typing `rcon your_command_here`.
* In the game, when connected to the server, do the same as in the previous way except for settings `rcon_address`.
* Go to the proxy IP in the browser (for example, if your proxy is at `ws://localhost:8015`, go to `http://localhost:8015`). On the Rcon line, enter your command in the left field and the password in the right field and press Send.

## Server info API

You can retrieve some server information in JSON format by going to special addresses on your server IP.

* `/server_info` - returns an object containing the server name `hostName`, current level name `levelName`, number of connected players `currentPlayers`, maximum number of players `maxPlayers` and API version `protocolVersion`. Gives 503 when server is off.
* `/player_info` - returns an array of objects with the info about a player, where # is player number starting from 0. Contains name `name`, shirt/pants color `colors`, shirt color is upper 4 bits, pants color is lower 4 bits), number of kills `frags`, time since connected `connectTime` and IP address `address`. Gives 503 when server is off or 404 if the player is not found.
* `/player_info/#` - returns single player info object for the player under the number #.
* `/rule_info` - returns an array of all server console variables (like movement variables), in `{rule:"variable name",value:"variable value"}` format.
* `/rule_info/variable_name` - returns single server console variable in the same format. 404 if the variable doesn't exist.

# Adding game music

To add music to WebQuake, you need to get the music off the Quake CD and convert it into .ogg format ([Audacity](http://audacity.sourceforge.net/) is great for this).

The .ogg files should be called `quake##.ogg`, where ## is CD track number minus 1 with trailing 0, so the main theme is named `quake01.ogg` and the last track on the Quake disc is `quake10.ogg`.

Then you should configure the server to return audio/ogg MIME type for .ogg files.

After that, create "media" folder in the "id1" folder (or, for the mission pack music, "hipnotic" or "rogue") and put the .ogg files into it.

# Browser support

The port has been tested on the following browsers:

* Firefox (Windows) - **Very good** - developed on it.
* Chrome (Windows) - **Very good** - no "loading" image.
* Firefox (Android) - **Okay** - very low performance (canvas is locked at 12 FPS), no mouse support. Keypresses are incorrect, not tested with Windows keyboard.
* Chrome (Android) - **Not Good** - no "loading" image, sound is broken (launch with `?-nosound -nocdaudio`), no mouse. Requires Windows-compatible keyboard for Esc and F1-F12 keys.
* Opera (Windows) - **Not Good** - low performance, nothing is drawn in water (type `r_waterwarp 0` in the console), no mouse.
* Internet Explorer (Windows) - **Unsupported** - bad TypedArray support, but likely many more issues.

Mouse support is currently available only on Chrome and Firefox. Stereo positional audio is supported on Chrome and Safari.

# Tips

If the sound randomly doesn't play, go to console (press ~ or Options > Go to console in main menu), type `stopsound` and press Enter.

You can delete saved games by pressing Del in the load or save menus. This only works for the saved games created in WebQuake.

# Intentionally unimplemented features

These features are intentionally left unimplemented in this build. Please don't make pull requests adding them.

* Gamepad support - uses vendor prefixes.

# Contributing

If you want to contribute to WebQuake, feel free to fork the project and make a pull request. Pull requests and issues will be reviewed by the developer.
