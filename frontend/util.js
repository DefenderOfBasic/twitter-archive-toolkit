export class Util {
  constructor() {
      this.accountId = null
      this.username = null

      this.tweetsById = {}
  }

  async fetchArchive(archiveUrl) {
    let archiveJson

    console.log("Fetching fresh copy")
    const isGzip = (archiveUrl.indexOf('.json.gz') != -1)
    const request = await fetch(archiveUrl)
    if (isGzip) {
      const arrayBuffer = await request.arrayBuffer()
      const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' }); // Decompress
      archiveJson = JSON.parse(decompressed)
    } else  {
      archiveJson = await request.json()
    }
    try {
      this.db.tweets.clear()
      await this.db.tweets.put({ id: 1, data: archiveJson, url: archiveUrl })
    } catch (e) {
      console.log("Failed to save tweets to Indexed DB", e)
    }
  
    
    this.accountId = archiveJson.account[0].account.accountId 
    this.username = archiveJson.account[0].account.username
    this.following = archiveJson.following

    this.tweetsById = {}
    return this.preprocessTweets(archiveJson.tweets)
  }

  preprocessTweets(tweetsJsonRaw) {
      const newTweets = []
      for (let i = 0; i < tweetsJsonRaw.length; i++) {
        const tweet = tweetsJsonRaw[i].tweet 
        tweet.url = `https://x.com/${this.username}/status/${tweet.id}`
        tweet.date = new Date(tweet.created_at)
        newTweets.push(tweet)
        this.tweetsById[tweet.id] = tweet
      }
      return newTweets
  }

  getThreads(tweets) {
      const newTweets = []
      let retweet_count = 0
      let external_reply_count = 0

      for (let i = 0; i < tweets.length; i++) {
        const { in_reply_to_user_id_str, in_reply_to_status_id, full_text } = tweets[i] 
          
        // ignore retweets
        if (full_text.startsWith('RT')) {
          retweet_count ++
          continue
        }
        // if it's a reply to ANOTHER user, ignore it
        if (in_reply_to_user_id_str != null && in_reply_to_user_id_str != this.accountId) {
          tweets[i].is_external_reply = true
          external_reply_count ++
          continue
        }
        // if it's a reply to self, link it to the tweet it is replying to
        if (in_reply_to_user_id_str == this.accountId) {
          const reply_id = in_reply_to_status_id
          if (!this.tweetsById[reply_id]) {
              console.error(`Error: failed to find tweet ${reply_id}`)
              continue
          }
          if (this.tweetsById[reply_id].is_external_reply) {
              // ignore linking because the parent is an external one
              tweets[i].is_external_reply = true
              external_reply_count ++
              continue
          } else {
              this.tweetsById[reply_id].nextTweet = tweets[i]
              tweets[i].parent = this.tweetsById[reply_id]
          }
        }

        newTweets.push(tweets[i])
      }

      return { tweets: newTweets, retweet_count, external_reply_count }
  }

  sortAscending(tweets) {
      return tweets.sort(function(a,b){
          return a.date - b.date
      })
  }

  sortDescending(tweets) {
      return tweets.sort(function(a,b){
          return b.date - a.date
      })
  }

  formatDate(date, options) {
      return date.toLocaleDateString('en-US', options || { 
          hour: 'numeric',
          year: 'numeric', 
          month: 'short',
          day: '2-digit'
      });
  }

  makeHTMLForTweet(tweet) {
      return `<div class="tweet">
    <p>${tweet.full_text}</p>
    <div class="metadata">
      <p>${this.formatDate(tweet.date)}</p>
      <div class="toolbar">
        ${Number(tweet.retweet_count).toLocaleString()} 🔂 ${Number(tweet.favorite_count).toLocaleString()} 🤍
        <a href="${tweet.url}" target="_blank" style="text-decoration:none">
          <svg width="20px" height="20px" viewBox="0 0 24 24" transform="translate(0 3)" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M9 15L20 4" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 4H20V9" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </a>
      </div>
    </div>
  </div>
  `
  }

  makeHTMLForThread(tweet) {
      let str = `<div class="thread">`
      while (tweet) {
          str += this.makeHTMLForTweet(tweet)
          tweet = tweet.nextTweet
      }
      str += '</div>'

      return str
  }

  getPopularityOverTime(tweets) {
    
    const likesPerDay = tweets.reduce((acc, item) => {
      const date = truncateToDay(item.date);
      const count = Number(item.favorite_count) + Number(item.retweet_count)
      acc[date] = (acc[date] || 0) + count;
      return acc;
    }, {});

    return sortByDate(Object.entries(likesPerDay)
          .map(item => { return { x: item[0], y: item[1] }}))
  }

  countTweetsPerDay(tweets) {
    // Step 1: Count occurrences for each day
    const dateCounts = tweets.reduce((acc, item) => {
      const date = truncateToDay(item.date);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Step 2: Sort days by the number of items
    const sortedDates = Object.entries(dateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => ({ date: entry[0], count: entry[1] }));
      return sortedDates
  }

  countTweetsPerHour(tweets) {
    const dateCounts = tweets.reduce((acc, item) => {
      const date = truncateToHour(item.date);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const sortedDates = Object.entries(dateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => ({ date: entry[0], count: entry[1] }));
      return sortedDates
  }

  isTweetInteractingWith(accountId, tweet) {
    // given an accountId, and a tweet
    // returns true if this tweet is interacting with the account
    const user_mentions = tweet.entities.user_mentions

    if (tweet.in_reply_to_user_id == accountId) {
        return true
    }

    for (let user of user_mentions) {
        if (user.id == accountId) {
            // this is true if I reply to them OR retweet
            return true
        }
    }
    return false
}
}


const truncateToDay = (date) => {
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
const day = (date.getDate()).toString().padStart(2, '0');
return `${year}-${month}-${day}`;
};

const truncateToHour = (date) => {
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
const day = (date.getDate() + 1).toString().padStart(2, '0');
const hour = (date.getHours()).toString().padStart(2, '0');
return `${year}-${month}-${day}/${hour}`;
};

const sortByDate = (arr) => {
return arr.sort((a, b) => {
  const dateA = new Date(a.x);
  const dateB = new Date(b.x);
  return dateA - dateB;
});
};