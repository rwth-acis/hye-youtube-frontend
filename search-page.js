/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * The HyE - YouTube serach results page
 */

export class SearchPage extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                border: solid 1px gray;
                padding: 16px;
                max-width: 800px;
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
            results: {type: Object},
        };
    }

    constructor() {
        super();
        this.proxyBaseUri = "http://localhost:8080/hye-youtube/";
        this.searchQuery = this.parseSearchQuery(window.location.search);
        this.results = [];
        this.fetchResults();
    }

    fetchResults() {
        fetch(`${this.proxyBaseUri}results?search_query=${this.searchQuery}`, {credentials: "include"})
            .then(response => {
                if (!response.ok) {
                    this.requestFailed(response);
                } else {
                    return response.json();
                }
            })
            .then(data => {
                this.results = data;
                this.requestUpdate();
            })
            .catch((error) => {
                this.status.innerHTML = "Error during request!";
                console.error('Error:', error);
            });
    }

    requestFailed(response) {
        response.json().then(obj => this.status.innerHTML = JSON.stringify(obj));
    }

    parseSearchQuery(searchQuery) {
        return searchQuery.split("search_query=")[1].split("&")[0];
    }

    localLink(link) {
        if (link[0] === '/')
            link = link.substring(1);
        return `/video.html?v=${link.split("v=")[1]}`;
    }

    youtubeLink(link) {
        if (link[0] === '/')
            return `https://www.youtube.com${link}`;
        else
            return `https://www.youtube.com/${link}`;
    }

    search() {
        window.location = (`/dev/search.html?search_query=${this.searchBar.value}`);
    }

    parseResult(res) {
        if (typeof res["title"] === "undefined" ||
          typeof res["channelName"] === "undefined" ||
          typeof res["link"] === "undefined" ||
          typeof res["channelLink"] === "undefined" ||
          typeof res["thumbnail"] === "undefined" ||
          typeof res["avatar"] === "undefined" ||
          typeof res["views"] === "undefined" ||
          typeof res["uploaded"] === "undefined"||
          typeof res["description"] === "undefined") {
            console.log("Incomplete result", res);
            return '';
        }
        return html`
            <div id="recContainer">
                <a id="thumbnailLink" href="${this.localLink(res.link)}">
                    <img id="thumbnail" src="${res.thumbnail}" />
                </a>
                <a id="titleLink" href="${this.localLink(res.link)}">
                    <p id="title">${res.title}</p>
                </a>
                <a id="channelLink" href="${this.youtubeLink(res.channelLink)}">
                    <p id="channelName">${res.channelName}</p>
                </a>
                <a id="detailsLink" href="${this.localLink(res.link)}">
                    <p id="details">${res.views} | ${res.uploaded}</p>
                </a>
                <a id="avatarLink" href="${this.youtubeLink(res.channelLink)}">
                    <img id="avatar" src="${res.avatar}" />
                </a>
                <p>${res.description}</p>
            </div>
        `;
    }

    render() {
        let searchResults = "";
        const reses = this.results;
        if (!this.results || this.results.length < 1) {
            searchResults = html`
                <div class="centerBox">
                    <h3><i id="statusMessage">Loading search results <i class="fa fa-spinner fa-pulse"></i></i></h3>
                </div>
                <div class="centerBox">
                    <div id="loadingAnimation"></div>
                </div>
                <link rel="stylesheet" href="../loading-animation/bouncyBalls.css">
                <script src="../loading-animation/bouncyBalls.js">
            `;
        } else {
            searchResults = html`
                <div class="centerBox">
                    <i id="statusMessage"></i>
                </div>
                <ul>
                    ${reses.map((res) => html`
                        <li class="ytRecItem">
                            ${this.parseResult(res)}
                        </li>`
                    )}
                </ul>
            `;
        }
        return html`
            <input id="searchBar" type="text" placeholder="Search YouTube"><button id="searchBtn" @click=${this.search}><i class="fas fa-search"></i></button>
            ${searchResults}
        `;
    }

    get status() {
        return this.renderRoot.querySelector("#statusMessage");
    }

    get searchBar() {
        return this.renderRoot.querySelector("#searchBar");
    }
}

window.customElements.define('search-page', SearchPage);
