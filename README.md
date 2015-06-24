# <img src="https://raw.githubusercontent.com/sethherr/soulheart/master/logo.png" alt="Soulheart" width="200"> Soulheart [![Build Status](https://travis-ci.org/sethherr/soulheart.svg)](https://travis-ci.org/sethherr/soulheart) [![Code Climate](https://codeclimate.com/github/sethherr/soulheart/badges/gpa.svg)](https://codeclimate.com/github/sethherr/soulheart) [![Test Coverage](https://codeclimate.com/github/sethherr/soulheart/badges/coverage.svg)](https://codeclimate.com/github/sethherr/soulheart/coverage)

To get started, check out examples and documentation at [sethherr.github.io/soulheart/](https://sethherr.github.io/soulheart/).

====

**Soulheart is a ready-to-use remote data source for autocomplete**. It supports:

- pagination
- categories
- sorting by priority (not just alphabetically)
- arbitrary return values/objects
- loading data via gists (or any url)
- mounting standalone or inside of a rails app

... and is [instantly deployable to heroku](https://heroku.com/deploy) (for free).


This project is in Beta. It's probably appropriate to use in production... but maybe wait? There are a few more changes coming, and some documentation improvements to be made.

### Adding data

You can add data from json, CSV and TSV files. 

Adding data is very simple - all you need is a `text` value.

Soulheart uses [line delineated JSON streams](https://en.wikipedia.org/wiki/JSON_Streaming#Line_delimited_JSON), so it doesn't have to load the whole file into memory. Which just means - put each object onto a seperate line.

For the simplest case, with just text values in JSON:

    { "text": "Jamis" }
    { "text": "Specialized" }
    { "text": "Trek" }

It accepts local files:

    soulheart load my_json_file.json

or remote files:
  
    soulheart load https://gist.githubusercontent.com/sethherr/96dbc011e508330ceec4/raw/95122b1fc9de85f241cd048f32b94568f54134e0/manufacturers.tsv


In addition to term, there are a few optional values - 

| Key          | Default     | What it does |
| ------------ | ----------- | ------------ |
| `priority`   | `100`       | Higher numbers come first |
| `category`   | `'default'` | Sets the category |
| `data`       | `{}`        | Returned object from search - the text and category will be added to this if you don't specify them. |

Here is an example of what a possible hash you could pass is

    { "text": "Jamis", "category": "Bike Manufacturer" }
    { "text": "Specialized" }
    { "text": "Trek" }

*If you set `text` in `data`, it will respond with that rather than the term it searches by. I haven't figured out a use case for this yet, but I'm sure one exists.*

======

I'm testing with: `ruby >= 2.1` and `redis >= 3`. 

Run `bundle exec guard` to run the specs while you work, it will just test the files you change.

This repo includes a `config.ru` and a `Gemfile.lock` so it (and any forks of it) can be deployed to heroku. They shouldn't be in the Gem itself.


======

This is an updated fork of [Seatgeek/Soulmate](https://github.com/seatgeek/soulmate) to address a few issues - namely [CORS support](../../issues/2), [minimum entry length](../../issues/3) and [playing better with Selectize & Select2](../../issues/4) - also the future.

Since [Seatgeek no longer uses Soulmate](https://news.ycombinator.com/item?id=9317891), and this isn't backward compatible it's a new project and gem.

:x::o::x::o::x::o: *Soulmate's README follows ([issue for making new documentation](../../issues/1))*

Soulmate is a tool to help solve the common problem of developing a fast autocomplete feature. It uses Redis's sorted sets to build an index of partially completed words and the corresponding top matching items, and provides a simple sinatra app to query them. Soulmate finishes your sentences.

Soulmate was designed to be simple and fast, and offers the following:

 * Provide suggestions for multiple types of items in a single query (at SeatGeek we're autocompleting for performers, events, and venues)
 * Results are ordered by a user-specified score
 * Arbitrary metadata for each item (at SeatGeek we're storing both a url and a subtitle)

An item is a simple JSON object that looks like:

    {
      "id": 3,
      "term": "Citi Field",
      "score": 81,
      "data": {
        "url": "/citi-field-tickets/",
        "subtitle": "Flushing, NY"
      }
    }

Where `id` is a unique identifier (within the specific type), `term` is the phrase you wish to provide completions for, `score` is a user-specified ranking metric (redis will order things lexicographically for items with the same score), and `data` is an optional container for metadata you'd like to return when this item is matched (at SeatGeek we're including a url for the item as well as a subtitle for when we present it in an autocomplete dropdown).

Getting Started
---------------

As always, kick things off with a `gem install`:

    gem install soulmate

### Loading Items

You can load data into Soulmate by piping items in the JSON lines format into `soulmate load TYPE`.

Here's a sample `venues.json` (one JSON item per line):

    {"id":1,"term":"Dodger Stadium","score":85,"data":{"url":"\/dodger-stadium-tickets\/","subtitle":"Los Angeles, CA"}}
    {"id":28,"term":"Angel Stadium","score":85,"data":{"url":"\/angel-stadium-tickets\/","subtitle":"Anaheim, CA"}}
    {"id":30,"term":"Chase Field ","score":85,"data":{"url":"\/chase-field-tickets\/","subtitle":"Phoenix, AZ"}}
    {"id":29,"term":"Sun Life Stadium","score":84,"data":{"url":"\/sun-life-stadium-tickets\/","subtitle":"Miami, FL"}}
    {"id":2,"term":"Turner Field","score":83,"data":{"url":"\/turner-field-tickets\/","subtitle":"Atlanta, GA"}}

And here's the load command (Soulmate assumes redis is running locally on the default port, or you can specify a redis connection string with the `--redis` argument):

    $ soulmate load venue --redis=redis://localhost:6379/0 < venues.json

You can also provide an array of strings under the `aliases` key that will also be added to the index for this item.

### Querying for Data

Once it's loaded, we can query this data by starting `soulmate-web`:

    $ soulmate-web --foreground --no-launch --redis=redis://localhost:6379/0

And viewing the service in your browser: http://localhost:5678/search?types[]=venue&term=stad. You should see something like:

    {
      "term": "stad",
      "results": {
        "venue": [
          {
            "id": 28,
            "term": "Angel Stadium",
            "score": 85,
            "data": {
              "url": "/angel-stadium-tickets/",
              "subtitle": "Anaheim, CA"
            }
          },
          {
            "id": 1,
            "term": "Dodger Stadium",
            "score": 85,
            "data": {
              "url": "/dodger-stadium-tickets/",
              "subtitle": "Los Angeles, CA"
            }
          },
          {
            "id": 29,
            "term": "Sun Life Stadium",
            "score": 84,
            "data": {
              "url": "/sun-life-stadium-tickets/",
              "subtitle": "Miami, FL"
            }
          }
        ]
      }
    }

The `/search` method supports multiple `types` as well as an optional `limit`. For example: `http://localhost:5678/search?types[]=event&types[]=venue&types[]=performer&limit=3&term=yank`. You can also add the `callback` parameter to enable JSONP output.

### Mounting soulmate into a rails app

If you are integrating Soulmate into a rails app, an alternative to launching a separate 'soulmate-web' server is to mount the sinatra app inside of rails.

Add this to routes.rb:

    mount Soulmate::Server, :at => "/sm"

Add this to gemfile:

    gem 'rack-contrib'
    gem 'soulmate', :require => 'soulmate/server'

Then you can query soulmate at the /sm url, for example: http://localhost:3000/sm/search?types[]=venues&limit=6&term=kitten

You can also config your redis instance:

    # config/initializers/soulmate.rb
    
    Soulmate.redis = 'redis://127.0.0.1:6379/0'
    # or you can asign an existing instance of Redis, Redis::Namespace, etc.
    # Soulmate.redis = $redis

### Rendering an autocompleter

Soulmate doesn't include any client-side code necessary to render an autocompleter, but Mitch Crowe put together a pretty cool looking jquery plugin designed for exactly that: <a href="https://github.com/mcrowe/soulmate.js">soulmate.js</a>.

Contributing to soulmate
------------------------
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Please try not to mess with the Rakefile, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

Copyright
---------

Copyright (c) 2011 Eric Waller. See LICENSE.txt for further details.
