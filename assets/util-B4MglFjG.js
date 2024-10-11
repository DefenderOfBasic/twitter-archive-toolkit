(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function o(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(t){if(t.ep)return;t.ep=!0;const n=o(t);fetch(t.href,n)}})();class h{constructor({db:e}){this.accountId=null,this.username=null,this.db=e,this.tweetsById={}}async fetchArchive(e){const o=await this.db.tweets.get(1);let r;if(o&&o.url===e)console.log("Getting stored tweet data from IndexedDB"),r=o.data;else{console.log("Fetching fresh copy");const t=e.indexOf(".json.gz")!=-1,n=await fetch(e);if(t){const s=await n.arrayBuffer(),u=pako.ungzip(new Uint8Array(s),{to:"string"});r=JSON.parse(u)}else r=await n.json();try{this.db.tweets.clear(),await this.db.tweets.put({id:1,data:r,url:e})}catch(s){console.log("Failed to save tweets to Indexed DB",s)}}return this.accountId=r.account[0].account.accountId,this.username=r.account[0].account.username,this.following=r.following,this.tweetsById={},this.preprocessTweets(r.tweets)}preprocessTweets(e){const o=[];for(let r=0;r<e.length;r++){const t=e[r].tweet;t.url=`https://x.com/${this.username}/status/${t.id}`,t.date=new Date(t.created_at),o.push(t),this.tweetsById[t.id]=t}return o}getThreads(e){const o=[];let r=0,t=0;for(let n=0;n<e.length;n++){const{in_reply_to_user_id_str:s,in_reply_to_status_id:u,full_text:d}=e[n];if(d.startsWith("RT")){r++;continue}if(s!=null&&s!=this.accountId){e[n].is_external_reply=!0,t++;continue}if(s==this.accountId){const a=u;if(!this.tweetsById[a]){console.error(`Error: failed to find tweet ${a}`);continue}if(this.tweetsById[a].is_external_reply){e[n].is_external_reply=!0,t++;continue}else this.tweetsById[a].nextTweet=e[n],e[n].parent=this.tweetsById[a]}o.push(e[n])}return{tweets:o,retweet_count:r,external_reply_count:t}}sortAscending(e){return e.sort(function(o,r){return o.date-r.date})}sortDescending(e){return e.sort(function(o,r){return r.date-o.date})}formatDate(e,o){return e.toLocaleDateString("en-US",o||{hour:"numeric",year:"numeric",month:"short",day:"2-digit"})}makeHTMLForTweet(e){return`<div class="tweet">
      <p>${e.full_text}</p>
      <div class="metadata">
        <p>${this.formatDate(e.date)}</p>
        <div class="toolbar">
          ${Number(e.retweet_count).toLocaleString()} 🔂 ${Number(e.favorite_count).toLocaleString()} 🤍
          <a href="${e.url}" target="_blank" style="text-decoration:none">
            <svg width="20px" height="20px" viewBox="0 0 24 24" transform="translate(0 3)" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M9 15L20 4" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 4H20V9" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
          </a>
        </div>
      </div>
    </div>
    `}makeHTMLForThread(e){let o='<div class="thread">';for(;e;)o+=this.makeHTMLForTweet(e),e=e.nextTweet;return o+="</div>",o}getPopularityOverTime(e){const o=e.reduce((r,t)=>{const n=c(t.date),s=Number(t.favorite_count)+Number(t.retweet_count);return r[n]=(r[n]||0)+s,r},{});return f(Object.entries(o).map(r=>({x:r[0],y:r[1]})))}countTweetsPerDay(e){const o=e.reduce((t,n)=>{const s=c(n.date);return t[s]=(t[s]||0)+1,t},{});return Object.entries(o).sort((t,n)=>n[1]-t[1]).map(t=>({date:t[0],count:t[1]}))}countTweetsPerHour(e){const o=e.reduce((t,n)=>{const s=l(n.date);return t[s]=(t[s]||0)+1,t},{});return Object.entries(o).sort((t,n)=>n[1]-t[1]).map(t=>({date:t[0],count:t[1]}))}isTweetInteractingWith(e,o){const r=o.entities.user_mentions;if(o.in_reply_to_user_id==e)return!0;for(let t of r)if(t.id==e)return!0;return!1}}const c=i=>{const e=i.getFullYear(),o=(i.getMonth()+1).toString().padStart(2,"0"),r=i.getDate().toString().padStart(2,"0");return`${e}-${o}-${r}`},l=i=>{const e=i.getFullYear(),o=(i.getMonth()+1).toString().padStart(2,"0"),r=(i.getDate()+1).toString().padStart(2,"0"),t=i.getHours().toString().padStart(2,"0");return`${e}-${o}-${r}/${t}`},f=i=>i.sort((e,o)=>{const r=new Date(e.x),t=new Date(o.x);return r-t});export{h as U};