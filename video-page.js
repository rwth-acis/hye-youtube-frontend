/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import "./loading-animation.js";

/**
 * The HyE - YouTube video page
 */

export class VideoPage extends LitElement {
    static get styles() {
        return css`
            :host {
                display: inline;
                padding: 16px;
            }
            ul {
                list-style-type: none;
            }
            a {
                text-decoration: none;
            }
            p {
                margin: 0px;
                padding: 0px;
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
                display: flex;
                padding: 7px 0px;
            }
            .videoInfo {
                max-width: 300px;
                width: 100%;
                float: right;
            }
            #title {
                margin-top: 0px;
                margin-bottom: 0.5em;
                font-weight: bold;
                color: black;
            }
            #channelName {
                color: black;
                margin-bottom: 0.5em;
            }
            #details {
                color: grey;
            }
            #loadingAnimationContainer {
                float: right;
            }
            #sidebar {
                font-family: sans-serif;
            }
            #video {
                width: 100%;
                max-width: fit-content;
                float: left;
                padding-right: 20px;
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
            #thumbnailLink {
                width: 300px;
            }
            #thumbnail {
                float: left;
                margin-right: 5px;
                width: 95%;
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
                vertical-align: bottom;
                margin-top: -30px;
                margin-right: 15px;
            }
            #obsBox {
                width: 360px;
                justify-content: center;
                display: grid;
                position: absolute;
                font-size: x-large;
            }
            #noHelpful {
                width: 92px;
                height: 92px;
                font-size: xxx-large;
            }
            #submitObs {
                width: 100px;
                height: 100px;
                border-radius: 0px;
                background-color: cornflowerblue;
                font-size: x-large;
            }
            @media screen and (max-width: 800px) {
                .recommendation {
                    display: inline-block;
                }
                #title {
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                    font-weight: bold;
                    color: black;
                }
                .videoInfo {
                    float: none;
                    max-width: fit-content;
                    width: 100%;
                }
                #length {
                    margin: -35px 20px 0px 0px;
                }
                #thumbnailLink {
                    display: inline-block;
                }
                #thumbnail {
                    float: none;
                }
                #loadingAnimationContainer {
                    float: none;
                    display: inline-block;
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
            recommendations: {type: Object},

            /**
             * The YouTube video ID of the currently playing video
             * @type {string}
             */
            videoId: {type: String},
        };
    }

    constructor() {
        super();
        this.proxyBaseUri = "http://localhost:8081/hye-youtube/";
        this.videoId = this.parseVideoId(window.location.search);
        this.videoTitle = "";
        this.videoUploadDate = "";
        this.videoViews = "";
        this.videoUpvotes = "";
        this.recommendations = [];
        this.fetchRecommendations();
    }

    fetchRecommendations() {
        fetch(`${this.proxyBaseUri}watch?v=${this.videoId}`, {credentials: "include"})
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
                this.status.innerHTML = data["msg"];
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

    parseVideoId(videoId) {
        return videoId.split("v=")[1].split("&")[0];
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

    parseRecommendation(rec) {
    	if (typeof rec["oneTimeCode"] !== "undefined")
    	    return html`
    	        <div class="recommendation">
    	            <div id="obsBox">
    	                <input type="number" id="noHelpful" min="0" max="${this.recommendations.length}"><br />
    	                <input type="button" id="submitObs" name="${rec["oneTimeCode"]}" @click=${this.sendObservation} value="Submit">
    	            </div>
    	        </div>`;
        if (typeof rec["title"] === "undefined" ||
          typeof rec["channelName"] === "undefined" ||
          typeof rec["link"] === "undefined" ||
          typeof rec["channelLink"] === "undefined" ||
          typeof rec["thumbnail"] === "undefined" ||
          typeof rec["length"] === "undefined" ||
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
                    <a id="titleLink" href="${this.localLink(rec.link)}">
                        <p id="title">${rec.title}</p>
                    </a>
                    <a id="channelLink" href="${this.youtubeLink(rec.channelLink)}">
                        <p id="channelName">${rec.channelName}</p>
                    </a>
                    <a id="detailsLink" href="${this.localLink(rec.link)}">
                        <p id="details">${rec.views} | ${rec.uploaded}</p>
                    </a>
                </div>
            </div>
        `;
    }

    render() {
        let videoWidth = window.innerWidth <= 800 ? window.innerWidth : window.innerWidth * 0.7;
        let sidebarWidth = window.innerWidth <= 800 ? window.innerWidth * 0.75 : window.innerWidth * 0.3 - 105;
        let videoHeight = videoWidth*9/16;
        let sidebar = "";
        const recs = this.recommendations;
        if (!this.recommendations || this.recommendations.length < 1) {
            sidebar = html`
                <h3><i id="statusMessage">Loading recommendations</i></h3>
                <div id="loadingAnimationContainer">
                    <loading-animation width="${sidebarWidth}" height=${videoHeight}></loading-animation>
                </div>
            `;
        } else {
            sidebar = html`
                <i id="statusMessage"></i>
                <ul>
                    ${recs.map((rec) => html`
                        <li class="ytRecItem">
                            ${this.parseRecommendation(rec)}
                        </li>`
                    )}
                </ul>
            `;
        }
        let video = "";
        if (this.videoId !== "") {
            video = html`
                <iframe width="${videoWidth}" height="${videoHeight}" src="https://www.youtube.com/embed/${this.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <h2 id="videoTitle">${this.videoTitle}</h2>
                <div id="detailContainer">
                    <p id="videoDetails">${this.videoViews} | ${this.videoUploadDate}</p><p id="upvotes"><i class="far fa-thumbs-up"></i>${this.videoUpvotes}</p>
                </div>
            `;
        }
        return html`
            <div id="searchBarContainer" style="width:${videoWidth}px;">
                <input id="searchBar" type="text" placeholder="Search YouTube" @keyup=${this.keyup}><input id="searchBtn" @click=${this.search}>
            </div>
            <div id="video">
	        ${video}
	    </div>
            <aside id="sidebar">
                ${sidebar}
            </aside>
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

    get submitObs() {
        return this.renderRoot.querySelector("#submitObs");
    }
}

window.customElements.define('video-page', VideoPage);
