/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import "./loading-animation.js";

/**
 * The HyE - YouTube serach results page
 */

export class SearchPage extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                padding: 16px;
            }
            ul {
                list-style-type: none;
            }
            a {
                text-decoration: none;
            }
            .inline {
                display: inline;
            }
            .centerBox {
                justify-content: center;
                display: inline;
                position: absolute;
            }
            .recommendation {
                font-family: sans-serif;
                display: flex;
                padding: 1em;
            }
            .videoInfo {
                display: inline-block;
                max-width: fit-content;
                width: 100%;
                margin: 0px 10px;
            }
            #title {
                margin-top: 0px;
                font-weight: bold;
                color: black;
            }
            #avatar {
                border-radius: 50%;
                vertical-align: middle;
            }
            #channelName {
                display: inline-block;
                color: black;
                padding: 5px;
            }
            #details {
                color: grey;
            }
            #description {
                display: block;
            }
            #searchBarContainer {
                display: block;
                padding: 10px 0px;
            }
            #searchBar {
                width: 80%;
                height: 30px;
            }
            #searchBtn {
                background-repeat: no-repeat;
                background-position: center;
                background-image: url(/img/search-solid.svg);
                background-size: 18px;
                height: 30px;
                width: 60px;
                background-color: lightblue;
                border: none;
                padding: 3px;
            }
            #searchBtn:hover {
                cursor: pointer;
            }
            #thumbnail {
                width: 100%;
                min-width: 360px;
                max-width: 360px;
                float: left;
            }
            #length {
                position: relative;
                z-index: 100;
                float: right;
                padding: 5px;
                background-color: rgba(0, 0, 0, 0.8);
                text-decoration: none;
                color: white;
                font-size: small;
                text-align: center;
                margin-top: 140px;
                margin-left: -60px;
                margin-right: 10px;
            }
            #obsStatus {
                color: grey;
                font-size: medium;
                padding: 1em 0px;
            }
            #obsBox {
                width: 360px;
                justify-content: center;
                display: grid;
                position: absolute;
                font-size: x-large;
            }
            #noHelpful {
                width: 350px;
                height: 200px;
                font-size: xxx-large;
            }
            #submitObs {
                width: 360px;
                height: 50px;
                border-radius: 0px;
                background-color: cornflowerblue;
                font-size: x-large;
            }
            @media screen and (max-width: 800px) {
                p {
                    padding: 0px;
                }
                ul {
                    padding-left: 0px;
                }
                .recommendation {
                    display: inline-block;
                    padding: 0px;
                    padding-bottom: 1em;
                }
                .videoInfo {
                    float: none;
                    max-width: fit-content;
                    width: 100%;
                }
                #title {
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                    font-weight: bold;
                    color: black;
                }
                #thumbnail {
                    float: none;
                }
                #loadingAnimationContainer {
                    float: none;
                }
                #searchBar {
                    width: 75%;
                    height: 30px;
                }
                #obsBox {
                    width: 360px;
                    position: relative;
                    font-size: x-large;
                }
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
        this.proxyBaseUri = "http://localhost:8081/hye-youtube/";
        this.searchQuery = this.parseSearchQuery(window.location.search);
        this.results = [];
        this.fetchResults();
    }

    fetchResults() {
        fetch(`${this.proxyBaseUri}results?search_query=${this.searchQuery}`, {credentials: "include"})
            .then(response => {
                this.loadingAnimationContainer.parentNode.removeChild(this.loadingAnimationContainer);
                if (response.ok) {
                    return response.json();
                } else {
                    this.requestFailed(response);
                    return;
                }
            })
            .then(data => {
                if (!data)
                    return;
                this.results = data;
                this.requestUpdate();
            })
            .catch((error) => {
                this.status.innerHTML = "Error during request!";
                console.error('Error:', error);
            });
    }

    sendObservation() {
        fetch(`${this.proxyBaseUri.replace("youtube", "recommendations")}observation`, {credentials: "include",
          method: "POST", headers: {"Content-Type": "application/json"},
          body: `{"oneTimeCode": "${this.submitObs.name}", "noVideos": ${this.results.length - 1}, "noHelpful": ${this.noHelpful.value}}`})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    this.requestFailed(response);
                    return;
                }
            })
            .then(data => {
                if (!data)
                    return;
                this.status.innerHTML = data["msg"];
            this.obsStatus.innerHTML = data["msg"];
            this.noHelpful.setAttribute("disabled", true);
            this.submitObs.setAttribute("disabled", true);
            })
            .catch((error) => {
                console.error('Error:', error);
                this.obsStatus.innerHTML = "Error during request!";
            });
    }

    requestFailed(response) {
        response.json().then(obj => {
            // hacky way to handle errors
            if (obj["msg"] === "class i5.las2peer.security.AnonymousAgentImpl cannot be cast to class i5.las2peer.api.security.UserAgent (i5.las2peer.security.AnonymousAgentImpl and i5.las2peer.api.security.UserAgent are in unnamed module of loader 'app')")
                this.status.innerHTML = "Please log in and refresh the page (F5) to use the service";
            else if (typeof obj["403"] !== "undefined")
                this.status.innerHTML = "Please upload a valid set of YouTube cookies via the settings page to use the service";
            else
                this.status.innerHTML = Object.values(obj);
        });
    }

    get noHelpful() {
        return this.renderRoot.querySelector("#noHelpful");
    }

    parseSearchQuery(searchQuery) {
        try {
            return searchQuery.split("search_query=")[1].split("&")[0];
        } catch (e) {
            console.log(e);
            return "Search YouTube";
        }
    }

    localLink(link) {
        if (link[0] === '/')
            link = link.substring(1);
        return `/watch?v=${link.split("v=")[1]}`;
    }

    youtubeLink(link) {
        if (link[0] === '/')
            return `https://www.youtube.com${link}`;
        else
            return `https://www.youtube.com/${link}`;
    }

    search() {
        window.location = (`/results?search_query=${this.searchBar.value}`);
    }

    keyup(event) {
        if (event.keyCode === 13)
            this.search();
    }

    parseResult(res) {
        if (typeof res["oneTimeCode"] !== "undefined")
    	    return html`
    	        <div class="recommendation">
    	            <div id="obsBox">
    	                <input type="number" id="noHelpful" min="0" max="${this.results.length-1}">
                        <p id="obsStatus">Please enter the number of interesting videos displayed on the page</p>
    	                <input type="button" id="submitObs" name="${res["oneTimeCode"]}" @click=${this.sendObservation} value="Submit">
    	            </div>
    	        </div>`;
        if (typeof res["title"] === "undefined" ||
          typeof res["channelName"] === "undefined" ||
          typeof res["link"] === "undefined" ||
          typeof res["channelLink"] === "undefined" ||
          typeof res["thumbnail"] === "undefined" ||
          typeof res["length"] === "undefined" ||
          typeof res["avatar"] === "undefined" ||
          typeof res["views"] === "undefined" ||
          typeof res["uploaded"] === "undefined"||
          typeof res["description"] === "undefined") {
            console.log("Incomplete result", res);
            return '';
        }
        return html`
            <div class="recommendation">
                <a id="thumbnailLink" href="${this.localLink(res.link)}">
                    <img id="thumbnail" src="${res.thumbnail}" />
                    <div id="length"><p>${res.length}</p></div>
                </a>
                <div class="videoInfo">
                    <a id="titleLink" href="${this.localLink(res.link)}">
                        <p id="title">${res.title}</p>
                    </a>
                    <a id="channelLink" href="${this.youtubeLink(res.channelLink)}">
                        <img id="avatar" src="${res.avatar}" /><p id="channelName">${res.channelName}</p>
                    </a>
                    <a id="detailsLink" href="${this.localLink(res.link)}">
                        <p id="details">${res.views} | ${res.uploaded}</p>
                    </a>
                <p id="description">${res.description}</p>
                </div>
            </div>
        `;
    }

    render() {
        let searchResults = "";
        const reses = this.results;
        if (!this.results || this.results.length < 1) {
            searchResults = html`
                <h3><i id="statusMessage">Loading search results</i></h3>
                <div id="loadingAnimationContainer">
                    <loading-animation width=${window.innerWidth*0.8} height=${window.innerHeight*0.6}></loading-animation>
                </div>
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
            <div id="searchBarContainer" style="width:${window.innerWidth<=400?window.innerWidth:window.innerWidth*0.6}px">
                <input id="searchBar" type="text" placeholder="${this.searchQuery}" @keyup=${this.keyup}><input id="searchBtn" @click=${this.search}>
            </div>
            ${searchResults}
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

    get noHelpful() {
        return this.renderRoot.querySelector("#noHelpful");
    }

    get obsStatus() {
        return this.renderRoot.querySelector("#obsStatus");
    }

    get obsBox() {
        return this.renderRoot.querySelector("#obsBox");
    }

    get submitObs() {
        return this.renderRoot.querySelector("#submitObs");
    }
}

window.customElements.define('search-page', SearchPage);
