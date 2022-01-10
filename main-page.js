/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * The HyE - YouTube main page
 */
// TODO Fix empty recommendation response - Should not throw error!
export class MainPage extends LitElement {
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
                if (!response.ok) {
                    this.requestFailed(response);
                }
                response.json();
            })
            .then(data => {
                this.recommendations = data;
                console.log('Success:', data);
                this.requestUpdate();
            })
            .catch((error) => {
                this.status.innerHTML = "Error during request!";
                console.error('Error:', error);
            });
    }

    requestFailed(response) {
        if (response.status == 400 || response.status == 401) {
            this.status.innerHTML = "There was an authorization error! You are lacking the required permissions for this request.";
        }
        else if (response.status == 500) {
            this.status.innerHTML = "There was a server error! Please try again later.";
        }
        this.status.innerHTML = "Server not responding... Please try again later.";
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
                <a id="thumbnailLink" href="${rec.link}">
                    <img id="thumbnail" src="${rec.thumbnail}" />
                </a>
                <a id="avatarLink" href="${rec.channelLink}">
                    <img id="avatar" src="${rec.avatar}" />
                </a>
                <a id="titleLink" href="${rec.link}">
                    <p id="title">${rec.title}</p>
                </a>
                <a id="channelLink" href="${rec.channelLink}">
                    <p id="channelName">${rec.channelName}</p>
                </a>
                <a id="detailsLink" href="${rec.link}">
                    <p id="details">${this.views} | ${this.uploaded}</p>
                </a>
            </div>
        `;
    }

    render() {
        if (!this.recommendations || this.recommendations.length < 1) {
            return html`
                <div class="centerBox">
                    <h3><i id="statusMessage">Loading recommendations...</i></h3>
                </div>
                <div class="centerBox">
                    <div id="loadingAnimation"></div>
                </div>
                <link rel="stylesheet" href="../loading-animation/bouncyBalls.css">
                <script src="../loading-animation/bouncyBalls.js">
            `;
        }
        const recs = this.recommendations;
        return html`
            <h1>HyE - YouTube</h1>
            <h2>Main Page</h2>
            <ul>
                ${recs.map((rec) => html`
                    <li class="ytRecItem">
                        ${this.parseRecommendation(rec)}
                    </li>`
                )}
            </ul>
        `;
    }

    get status() {
        return this.renderRoot.querySelector("#statusMessage");
    }
}

window.customElements.define('main-page', MainPage);
