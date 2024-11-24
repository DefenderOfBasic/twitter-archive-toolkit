import{U as g}from"./util-o58FNkjN.js";T();async function T(){const i=await(await fetch("DefenderOfBasic.json.gz")).json(),n=new g;n.accountId=i.account[0].account.accountId,n.username=i.account[0].account.username,n.name=i.account[0].account.accountDisplayName,n.avatar=i.profile[0].profile.avatarMediaUrl;let u=n.preprocessTweets(i.tweets);u=n.sortAscending(u);const d=n.getThreads(u),h={};for(let t=0;t<d.tweets.length;t++){const r=d.tweets[t];if(r.parent)continue;const c=[r];let e=r;for(;e.nextTweet;)c.push(e.nextTweet),e=e.nextTweet;h[r.id]=c}const m=document.querySelector("#clusterThreads");document.querySelector(".search-box").addEventListener("keydown",async function(t){if(t.key==="Enter"&&!t.shiftKey){m.innerHTML="<h3>Loading...</h3>",t.preventDefault();const r=this.value,e=await(await fetch("https://semantic-search.defenderofbasic.workers.dev/query",{method:"POST",body:JSON.stringify({searchTerm:r})})).json();let s="";for(let o=0;o<e.matches.length;o++){const f=e.matches[o],w=h[f.metadata.id];s+=p(w,f.score)}m.innerHTML=s,console.log(e.matches.map(o=>({score:o.score,text:o.metadata.text,id:o.metadata.id})))}});function p(t,r){let c="";c+=`<h2>${t.length} tweets</h2>
                    <p>${r}</p>`;for(let e=0;e<t.length;e++){const s=t[e];c+=`<tweet-component
                            avatar="${n.avatar}"
                            name="${n.name}"
                            username="${n.username}"
                            timestamp="${s.date}"
                            likes="${s.favorite_count}"
                            retweets="${s.retweet_count}"
                            url="${s.url.trim()}"
                        >
                        ${v(s.full_text)}
                        </tweet-component>
                    `}return c+="</div>",c}}function v(l){let a=l.replace(/"/g,"&quot;");return a=a.replace(/'/g,"&#39;"),a=a.replace(/\n/g,"<br>"),a=a.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>'),a}
