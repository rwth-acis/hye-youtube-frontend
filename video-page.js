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
                width: 500px;
                top: 25%;
                left: 50%;
                position: absolute;
                justify-content: center;
                margin-left: -250px;
                display: flex;
            }
            .recommendation {
                font-family: sans-serif;
                display: flex;
                padding: 7px 0px;
            }
            .videoInfo {
                max-width: fit-content;
                width: 100%;
                float: right;
            }
            #title {
                margin-top: 0px;
                margin-bottom: 0.5em;
                font-size: large;
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
                background-color: lightgrey;
                background-repeat: no-repeat;
                background-position: center;
                background-image: url(/img/search-solid.svg);
                background-size: 20px;
                height: 30px;
                width: 40px;
            }
            #searchBtn:hover {
                cursor: pointer;
            }
            #thumbnail {
                float: left;
                margin-right: 5px;
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
                if (!data) {
                    this.status.innerHTML = "Error during request!";
                    return;
                }
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

    parseVideoId(videoId) {
        return videoId.split("v=")[1].split("&")[0];
    }

    localLink(link) {
        if (link[0] === '/')
            link = link.substring(1);
        return `/dev/video.html?v=${link.split("v=")[1]}`;
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

    keyup(event) {
        if (event.keyCode === 13)
            this.search();
    }

    parseRecommendation(rec) {
        if (typeof rec["title"] === "undefined" ||
          typeof rec["channelName"] === "undefined" ||
          typeof rec["link"] === "undefined" ||
          typeof rec["channelLink"] === "undefined" ||
          typeof rec["thumbnail"] === "undefined" ||
          typeof rec["views"] === "undefined" ||
          typeof rec["uploaded"] === "undefined") {
            console.log("Incomplete recommendation", rec);
            return '';
        }
        return html`
            <div class="recommendation">
                <a id="thumbnailLink" href="${this.localLink(rec.link)}">
                    <img id="thumbnail" src="${rec.thumbnail}" />
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
        let videoWidth = window.innerWidth * 0.7;
        let videoHeight = videoWidth * 9 / 16;
        let sidebar = "";
        const recs = this.recommendations;
        if (!this.recommendations || this.recommendations.length < 1) {
            sidebar = html`
                <h3><i id="statusMessage">Loading recommendations</i></h3>
                <div id="loadingAnimationContainer">
                    <loading-animation width="${window.innerWidth - videoWidth - 105}" height=${videoHeight}></loading-animation>
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
}

window.customElements.define('video-page', VideoPage);
