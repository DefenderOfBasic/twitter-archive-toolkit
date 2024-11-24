class TweetComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const avatar = this.getAttribute('avatar');
        const name = this.getAttribute('name');
        const username = this.getAttribute('username');
        const content = this.getAttribute('content');
        const timestamp = new Date(this.getAttribute('timestamp')).toLocaleString();
        const likes = this.getAttribute('likes');
        const retweets = this.getAttribute('retweets');
        const url = this.getAttribute('url');

        this.shadowRoot.innerHTML = `
            <style>
                a {
                    color: black;
                    text-decoration: none; /* no underline */
                }
                .tweet {
                    margin: 5px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 16px;
                    max-width: 400px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .tweet-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    margin-right: 12px;
                }
                .user-info {
                    display: flex;
                    flex-direction: column;
                }
                .name {
                    font-weight: bold;
                }
                .username {
                    color: #536471;
                }
                .content {
                    margin-bottom: 12px;
                    line-height: 1.4;
                }
                .timestamp {
                    color: #536471;
                    font-size: 0.9em;
                    margin-bottom: 12px;
                }
                .actions {
                    display: flex;
                    justify-content: space-between;
                    color: #536471;
                    font-size: 0.9em;
                }
            </style>
            
                <div class="tweet">
                    <a href="${url}">
                    <div class="tweet-header">
                        <img class="avatar" src="${avatar}" alt="${name}'s avatar">
                        <div class="user-info">
                            <span class="name">${name}</span>
                            <span class="username">@${username}</span>
                        </div>
                    </div>
                    </a>
                    <slot class="content"></slot>
                    <div class="timestamp">${timestamp}</div>
                    <div class="actions">
                        <span>♥ ${likes}</span>
                        <span>🔁 ${retweets}</span>
                    </div>
                </div>

            

            
        `;
    }
}

customElements.define('tweet-component', TweetComponent);
