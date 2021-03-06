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
                display: block;
                padding: 16px;
            }
            ul {
                list-style-type: none;
            }
            li {
                display: inline-block;
            }
            p {
                margin: 0px;
                padding: 2px;
            }
            a {
                text-decoration: none;
            }
            .inline {
                display: inline;
            }
            .centerBox {
                justify-content: center;
                display: flex;
                position: absolute;
            }
            .recommendation {
                font-family: sans-serif;
                display: inline-block;
                padding: 1em 10px;
            }
            .videoInfo {
                display: flex;
                width: 360px;
            }
            #avatar {
                border-radius: 50%;
                padding-right: 5px;
            }
            #title {
                margin-top: 0px;
                font-weight: bold;
                color: black;
            }
            #channelName {
                color: black;
            }
            #details {
                color: grey;
            }
            #videoDetails {
                display: inline-block;
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
                vertical-align: middle;
                background-color: lightblue;
                border: none;
                padding: 16px;
            }
            #searchBtn:hover {
                cursor: pointer;
            }
            #thumbnail {
                max-width: 360px;
            }
            #length {
                position: relative;
                z-index: 100;
                padding: 5px;
                background-color: rgba(0,0,0,80%);
                text-decoration: none;
                color: white;
                font-size: small;
                text-align: center;
                width: fit-content;
                left: 300px;
                max-width: 60px;
                margin-top: -40px;
                margin-bottom: 20px;
            }
            #obsStatus {
                color: grey;
                font-size: medium;
                padding: 1em 0px;
            }
            #obsBox {
                width: 360px;
                margin-top: -270px;
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
                    margin-top: 0px;
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
            recommendations: {type: Object},
        };
    }

    constructor() {
        super();
        this.proxyBaseUri = "http://localhost:8081/hye-youtube/";
        this.recommendations = [];
        this.fetchRecommendations();
    }

    fetchRecommendations() {
        fetch(this.proxyBaseUri, {credentials: "include"})
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
                this.recommendations = data;
                this.requestUpdate();
            })
            .catch((error) => {
                console.error('Error:', error);
                this.status.innerHTML = "Error during request!";
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

    sendObservation() {
        fetch(`${this.proxyBaseUri.replace("youtube", "recommendations")}observation`, {credentials: "include",
          method: "POST", headers: {"Content-Type": "application/json"},
          body: `{"oneTimeCode": ${this.submitObs.name}, "noVideos": ${this.recommendations.length - 1}, "noHelpful": ${this.noHelpful.value}}`})
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
                this.obsStatus.innerHTML = data["msg"];
                this.noHelpful.setAttribute("disabled", true);
                this.submitObs.setAttribute("disabled", true);
            })
            .catch((error) => {
                console.error('Error:', error);
                this.obsStatus.innerHTML = "Error during request!";
            });
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
        return `/watch?v=${link.split("v=")[1]}`;
    }

    search() {
        window.location = (`/results?search_query=${this.searchBar.value}`);
    }

    keyup(event) {
        if (event.keyCode === 13)
            this.search();
    }

    parseRecommendation(rec) {
        if (typeof rec["oneTimeCode"] !== "undefined")
    	    return html`
    	        <div class="recommendation">
    	            <div id="obsBox">
    	                <input type="number" id="noHelpful" min="0" max="${this.recommendations.length-1}">
                        <p id="obsStatus">Please enter the number of interesting videos displayed on the page</p>
    	                <input type="button" id="submitObs" name="${rec["oneTimeCode"]}" @click=${this.sendObservation} value="Submit">
    	            </div>
    	        </div>`;
        if (typeof rec["title"] === "undefined" ||
          typeof rec["channelName"] === "undefined" ||
          typeof rec["link"] === "undefined" ||
          typeof rec["channelLink"] === "undefined" ||
          typeof rec["thumbnail"] === "undefined" ||
          typeof rec["length"] === "undefined" ||
          typeof rec["avatar"] === "undefined" ||
          typeof rec["views"] === "undefined" ||
          typeof rec["uploaded"] === "undefined") {
            console.log("Incomplete recommendation", rec);
            return '';
        }
        return html`
            <div class="recommendation">
                <a id="thumbnailLink" href="${this.localLink(rec.link)}">
                    <img id="thumbnail" src="${rec.thumbnail}" />
                    <div id="length"><p>${rec.length}</p></div>
                </a>
                <div class="videoInfo">
                    <a id="avatarLink" href="${this.youtubeLink(rec.channelLink)}">
                        <img id="avatar" src="${rec.avatar}" />
                    </a>
                    <div id="videoDetails">
                        <a id="titleLink" href="${this.localLink(rec.link)}">
                            <p id="title">${rec.title}</p>
                        </a>
                        <a id="channelLink" href="${this.youtubeLink(rec.channelLink)}">
                            <p id="channelName">${rec.channelName}</p>
                        </a>
                        <a id="detailsLink" href="${this.youtubeLink(rec.link)}">
                            <p id="details">${rec.views} | ${rec.uploaded}</p>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        let recommendations = "";
        const recs = this.recommendations;
        if (!this.recommendations || this.recommendations.length < 1) {
            recommendations = html`
                <h3><i id="statusMessage">Loading recommendations</i></h3>
                <div id="loadingAnimationContainer">
                    <loading-animation width=${window.innerWidth*0.8} height=${window.innerHeight*0.6}></loading-animation>
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
            <div id="searchBarContainer" style="width:${window.innerWidth<=400?window.innerWidth:window.innerWidth*0.6}px">
                <input id="searchBar" type="text" placeholder="Search YouTube" @keyup=${this.keyup}><input type="button" id="searchBtn" @click=${this.search}>
            </div>
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

window.customElements.define('main-page', MainPage);
