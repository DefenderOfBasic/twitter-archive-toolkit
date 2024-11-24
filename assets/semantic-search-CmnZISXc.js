import{U as T}from"./util-o58FNkjN.js";v();async function v(){const p=await(await fetch("DefenderOfBasic.json")).arrayBuffer(),w=pako.ungzip(new Uint8Array(p),{to:"string"}),i=JSON.parse(w),a=new T;a.accountId=i.account[0].account.accountId,a.username=i.account[0].account.username,a.name=i.account[0].account.accountDisplayName,a.avatar=i.profile[0].profile.avatarMediaUrl;let u=a.preprocessTweets(i.tweets);u=a.sortAscending(u);const d=a.getThreads(u),h={};for(let t=0;t<d.tweets.length;t++){const r=d.tweets[t];if(r.parent)continue;const s=[r];let e=r;for(;e.nextTweet;)s.push(e.nextTweet),e=e.nextTweet;h[r.id]=s}const f=document.querySelector("#clusterThreads");document.querySelector(".search-box").addEventListener("keydown",async function(t){if(t.key==="Enter"&&!t.shiftKey){f.innerHTML="<h3>Loading...</h3>",t.preventDefault();const r=this.value,e=await(await fetch("https://semantic-search.defenderofbasic.workers.dev/query",{method:"POST",body:JSON.stringify({searchTerm:r})})).json();let c="";for(let o=0;o<e.matches.length;o++){const m=e.matches[o],y=h[m.metadata.id];c+=g(y,m.score)}f.innerHTML=c,console.log(e.matches.map(o=>({score:o.score,text:o.metadata.text,id:o.metadata.id})))}});function g(t,r){let s="";s+=`<h2>${t.length} tweets</h2>
                    <p>${r}</p>`;for(let e=0;e<t.length;e++){const c=t[e];s+=`<tweet-component
                            avatar="${a.avatar}"
                            name="${a.name}"
                            username="${a.username}"
                            timestamp="${c.date}"
                            likes="${c.favorite_count}"
                            retweets="${c.retweet_count}"
                            url="${c.url.trim()}"
                        >
                        ${$(c.full_text)}
                        </tweet-component>
                    `}return s+="</div>",s}}function $(l){let n=l.replace(/"/g,"&quot;");return n=n.replace(/'/g,"&#39;"),n=n.replace(/\n/g,"<br>"),n=n.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>'),n}
