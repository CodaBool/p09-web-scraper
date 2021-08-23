# Endpoints
- /trending-github
- /upcoming-movies
- /trending-movies
- /trending-tv
- /upcoming-games
- /trending-npm-1
- /trending-npm-2
- /get-build

# Setup
create a local-data.json with the following data

```json
{
  "pathParameters": {
    "id": "trending-tv"
  }
}
```
this will allow the different scraping endpoints to be hit.


# Command
sls invoke local -f api -p local-data.json