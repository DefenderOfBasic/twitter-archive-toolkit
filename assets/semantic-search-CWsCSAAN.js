import{U as v}from"./util-Dez4eFDU.js";S();async function S(){const g=await(await fetch("DefenderOfBasic.json")).arrayBuffer(),y=pako.ungzip(new Uint8Array(g),{to:"string"}),i=JSON.parse(y),n=new v;n.accountId=i.account[0].account.accountId,n.username=i.account[0].account.username,n.name=i.account[0].account.accountDisplayName,n.avatar=i.profile[0].profile.avatarMediaUrl;let l=n.preprocessTweets(i.tweets);l=n.sortAscending(l);const f=n.getThreads(l),u=[],p={};let d=0;for(let t=0;t<f.tweets.length;t++){const o=f.tweets[t];if(o.parent)continue;const r=[o];let e=o;for(;e.nextTweet;)d+=e.full_text.split(" ").length,r.push(e.nextTweet),e=e.nextTweet;u.push(r),p[o.id]=r}document.querySelector("#subtitle").innerHTML=`${d.toLocaleString()} words - ${u.length.toLocaleString()} threads`,console.log({wordCount:d,threadsLength:u.length});const m=document.querySelector("#clusterThreads");document.querySelector(".search-box").addEventListener("keydown",async function(t){if(t.key==="Enter"&&!t.shiftKey){m.innerHTML="<h3>Loading...</h3>",t.preventDefault();const o=this.value,e=await(await fetch("https://semantic-search.defenderofbasic.workers.dev/query",{method:"POST",body:JSON.stringify({searchTerm:o})})).json();let s="";for(let c=0;c<e.matches.length;c++){const w=e.matches[c],$=p[w.metadata.id];s+=T($,w.score)}m.innerHTML=s,console.log(e.matches.map(c=>({score:c.score,text:c.metadata.text,id:c.metadata.id})))}});function T(t,o){let r="";r+=`<h2>${t.length} tweets</h2>
                    <p>${o}</p>`;for(let e=0;e<t.length;e++){const s=t[e];r+=`<tweet-component
                            avatar="${n.avatar}"
                            name="${n.name}"
                            username="${n.username}"
                            timestamp="${s.date}"
                            likes="${s.favorite_count}"
                            retweets="${s.retweet_count}"
                            url="${s.url.trim()}"
                        >
                        ${x(s.full_text)}
                        </tweet-component>
                    `}return r+="</div>",r}}function x(h){let a=h.replace(/"/g,"&quot;");return a=a.replace(/'/g,"&#39;"),a=a.replace(/\n/g,"<br>"),a=a.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>'),a}
