import{U as u}from"./util-CzBO0abx.js";const o=document.querySelector("#datasource-input");localStorage.getItem("archiveUrl")&&(o.value=localStorage.getItem("archiveUrl"));const l=new URLSearchParams(window.location.search);l.get("url")&&(o.value=l.get("url"));let r=new u;async function i(){console.log("Fetching"),document.querySelector("#title").innerHTML="Loading..";try{const e=o.value,t=await r.fetchArchive(e);document.querySelector("#title").innerHTML=`${r.username} (${t.length.toLocaleString()} tweets)`,m(t),localStorage.setItem("archiveUrl",o.value),w("url",o.value)}catch(e){console.error(e),g(`Failed to fetch tweets: ${String(e)}`)}d(),document.querySelector("#fetch-btn").onclick=async e=>{i()}}i();function m(e){let n='<p class="muted-text">Showing first 1000 tweets:</p>';const c=r.sortAscending(e);for(let a=0;a<c.length;a++){const s=c[a];if(n+=f(s),a>1e3)break}document.querySelector("#tweet-container").innerHTML=n}function g(e){document.querySelector("#error").innerHTML=e}function d(e){document.querySelector("#loading-text").style.display="none"}function w(e,t){const n=new URLSearchParams(window.location.search);n.set(e,t),window.history.replaceState({},"",`${window.location.pathname}?${n}`)}function f(e){return`<tweet-component
                            avatar="${r.avatar}"
                            name="${r.name}"
                            username="${r.username}"
                            timestamp="${e.date}"
                            likes="${e.favorite_count}"
                            retweets="${e.retweet_count}"
                            url="${e.url.trim()}"
                        >
                        ${h(e.full_text)}
                        </tweet-component>
                    `}function h(e){let t=e.replace(/"/g,"&quot;");return t=t.replace(/'/g,"&#39;"),t=t.replace(/\n/g,"<br>"),t=t.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>'),t}
