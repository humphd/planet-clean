# planet-clean

Cleans-up the [CDOT planet feed list](https://wiki.cdot.senecacollege.ca/wiki/Planet_CDOT_Feed_List) so that all
blog feeds in the [CDOT planet](http://zenit.senecac.on.ca/~chris.tyler/planet/)
are valid.

## Installation

First, install all dependencies:

```
npm install
```

## Usage

To run:

```
node cli.js
```

or 

```
./cli.js
```

This will download the current feed list, process every name/URL pair,
and attempt to download and parse each feed URL. If the feed parser fails,
the name/URL will be commented out.  Otherwise it will be included.

Final results are written to `cleaned-planet-list.txt`.  You can manually
copy/paste this into the wiki [Feeds section](https://wiki.cdot.senecacollege.ca/wiki/Planet_CDOT_Feed_List#Feeds).
