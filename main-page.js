/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import "./loading-animation.js";

/**
 * The HyE - YouTube main page
 */

export class MainPage extends LitElement {
    static get styles() {
        return css`
            :host {
                border: solid 1px gray;
                display: block;
                max-width: 800px;
                padding: 16px;
            }
            .centerBox {
                width: 500px;
                top: 25%;
                left: 50%;
                position: absolute;
                justify-content: center;
                margin-left: -250px;
                display: flex;
            }
        `;
    }

    static get properties() {
        return {
            /**
             * The base URI of the las2peer backend service (HyE - YouTubeProxy)
             * @type {string}
             */
            proxyBaseUri: {type: String},

            /**
             * The recommendation data obtained from the backend service
             * @type {object}
             */
            recommendations: {type: Object},
        };
    }

    constructor() {
        super();
        this.proxyBaseUri = "http://localhost:8080/hye-youtube/";
        this.recommendations = [];
        this.fetchRecommendations();
    }

    fetchRecommendations() {
        fetch(this.proxyBaseUri, {credentials: "include"})
            .then(response => {
                this.loadingAnimationContainer.parentNode.removeChild(this.loadingAnimationContainer);
                if (!response.ok) {
                    this.requestFailed(response);
                } else {
                    return response.json();
                }
            })
            .then(data => {
                this.recommendations = data;
                this.requestUpdate();
            })
            .catch((error) => {
                console.error('Error:', error);
                this.status.innerHTML = "Error during request!";
            });
    }

    requestFailed(response) {
        response.json().then(obj => this.status.innerHTML = JSON.stringify(obj));
    }

    youtubeLink(link) {
        if (link[0] === '/')
            return `https://www.youtube.com${link}`;
        else
            return `https://www.youtube.com/${link}`;
    }

    localLink(link) {
        if (link[0] === '/')
            link = link.substring(1);
        return `/video.html?v=${link.split("v=")[1]}`;
    }

    search() {
        window.location = (`/dev/search.html?search_query=${this.searchBar.value}`);
    }

    parseRecommendation(rec) {
        if (typeof rec["title"] === "undefined" ||
          typeof rec["channelName"] === "undefined" ||
          typeof rec["link"] === "undefined" ||
          typeof rec["channelLink"] === "undefined" ||
          typeof rec["thumbnail"] === "undefined" ||
          typeof rec["avatar"] === "undefined" ||
          typeof rec["views"] === "undefined" ||
          typeof rec["uploaded"] === "undefined") {
            console.log("Incomplete recommendation", rec);
            return '';
        }
        return html`
            <div id="recContainer">
                <a id="thumbnailLink" href="${this.localLink(rec.link)}">
                    <img id="thumbnail" src="${rec.thumbnail}" />
                </a>
                <a id="avatarLink" href="${this.youtubeLink(rec.channelLink)}">
                    <img id="avatar" src="${rec.avatar}" />
                </a>
                <a id="titleLink" href="${this.localLink(rec.link)}">
                    <p id="title">${rec.title}</p>
                </a>
                <a id="channelLink" href="${this.youtubeLink(rec.channelLink)}">
                    <p id="channelName">${rec.channelName}</p>
                </a>
                <a id="detailsLink" href="${this.youtubeLink(rec.link)}">
                    <p id="details">${rec.views} | ${rec.uploaded}</p>
                </a>
                <p id="description">${rec.description}</p>
            </div>
        `;
    }

    render() {
        let recommendations = "";
        const recs = this.recommendations;
        if (!this.recommendations || this.recommendations.length < 1) {
            recommendations = html`
                <div class="centerBox">
                    <h3><i id="statusMessage">Loading recommendations</i></h3>
                </div>
                <div id="loadingAnimationContainer" class="centerBox">
                    <loading-animation></loading-animation>
                </div>
            `;
        } else {
            recommendations = html`
                <ul>
                    ${recs.map((rec) => html`
                        <li class="ytRecItem">
                            ${this.parseRecommendation(rec)}
                        </li>`
                    )}
                </ul>
            `;
        }
        return html`
            <link rel="stylesheet" href="../node_modules/@fortawesome/fontawesome-free/css/all.css">
            <script source="../node_modules/@fortawesome/fontawesome-free/js/all.js"></script>
            <input id="searchBar" type="text" placeholder="Search YouTube"><button id="searchBtn" @click=${this.search}><i class="fas fa-search"></i></button>
            ${recommendations}
        `;
    }

    get status() {
        return this.renderRoot.querySelector("#statusMessage");
    }

    get searchBar() {
        return this.renderRoot.querySelector("#searchBar");
    }

    get loadingAnimationContainer() {
        return this.renderRoot.querySelector("#loadingAnimationContainer");
    }
}

window.customElements.define('main-page', MainPage);
