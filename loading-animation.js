/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * A idle loading animation for the HyE - YouTube frontend
 */

export class LoadingAnimation extends LitElement {
    static get properties() {
        return {
            /**
             * The height of the container
             * @type {number}
             */
            height: {type: Number},

            /**
             * The width of the container
             * @type {number}
             */
            width: {type: Number},

            /**
             * The positions and impulses of the balls
             * @type {object}
             */
            _ballStats: {type: Object},
        };
    }

    constructor() {
        super();
        this.height = 270;
        this.width = 480;
        this.noBalls = 0;
        this._ballStats = [];
        setInterval(() => {
            this._ballStats.forEach((ball) => {
                ball["xValue"] += ball["xSpeed"];
                ball["yValue"] += ball["ySpeed"];
                if (ball["xValue"] <= 0 || ball["xValue"] >= this.width - 30) {
                    ball["xSpeed"] *= -1;
                }
                if (ball["yValue"] <= 0 || ball["yValue"] >= this.height - 30) {
                    ball["ySpeed"] *= -1;
                }
            });
            this.requestUpdate();
        }, 10);
    }

    init() {
        if (this._ballStats.length <= 0)
        {
            if (this.noBalls === 0)
                this.noBalls = this.height * this.width / 20000;
            for (let i = 0; i <= this.noBalls; ++i) {
                let newBall = {
                    "xValue": Math.random() * (this.width - 30),
                    "yValue": Math.random() * (this.height - 30),
                    "xSpeed": (((Math.random() * this.width) / 35) + 5) * (Math.random() - 0.5),
                    "ySpeed": (((Math.random() * this.height) / 35) + 5) * (Math.random() - 0.5)
                };
                this._ballStats.push(newBall);
            }
        }
    }

    render() {
        this.init();
        return html`
            <style>
                :host {
                    border: solid 1px gray;
                    display: block;
                    max-width: 800px;
                    padding: 16px;
                }
                #loadingAnimation {
                    position: relative;
                    width: ${this.width}px;
                    height: ${this.height}px;
                    box-shadow: 5px 5px 5px lightgrey inset;
                    border: 2px darkgrey solid;
                }
                .ball {
                    position: absolute;
                    height: 30px;
                    width: 30px;
                    border-radius: 50%;
                    display: block;
                    background-image: url(https://image.flaticon.com/icons/png/512/541/541732.png);
                    background-size: 30px;
                }
            </style>
            <div id="loadingAnimation" @load=${this.init}>
                ${this._ballStats.map((ball) => html`
                    <span class="ball" style="left:${ball["xValue"]}px;top:${ball["yValue"]}px"></span>
                `)}
            </div>
        `;
    }

    get loadingAnimation() {
        return this.renderRoot.querySelector("#loadingAnimation");
    }

    get balls() {
        return this.renderRoot.querySelectorAll(".ball");
    }
}

window.customElements.define('loading-animation', LoadingAnimation);
