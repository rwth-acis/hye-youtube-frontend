/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * The HyE - YouTube configuration page
 */

 // TODO POSTS don't return JSON, but plain text! Adjust response handlers accordingly
export class ConfigPage extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                border: solid 1px gray;
                padding: 16px;
                max-width: 800px;
            }
            input {
                border-radius: 0;
                background-color: inherit;
            }
            .centerBox {
                position: inline-block;
                justify-content: center;
                display: flex;
            }
            .delete {
                background-color: red;
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
             * Whether the current user has already shared their cookies
             * @type {boolean}
             */
            sharedCookies: {type: Boolean},

            /**
             * The permissions granted by the current user
             * @type {object}
             */
            consents: {type: Object},

            /**
             * The permissions granted to the current user
             * @type {object}
             */
            permissions: {type: Object},
        };
    }

    constructor() {
        super();
        this.proxyBaseUri = "http://localhost:8080/hye-youtube/";
        this.sharedCookies = false;
        this.consents = [];
        this.permissions = [];
        this.fetchCookies();
        this.fetchConsent();
        this.fetchPermissions();
    }

    fetchCookies() {
        fetch(this.proxyBaseUri + "cookies/", {credentials: "include"}).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.cookieStatus);
            }
            return response.json();
            }).then(data => {
                if (typeof data["200"] !== "undefined") {
                    this.sharedCookies = true;
                }
                else if (Array.isArray(data)) {
                    if (data.length === 0) {
                        this.cookieStatus.innerHTML = "Currently you have not uploaded any valid YouTube cookies. Please do so, in order to use this service :)";
                    } else {
                        this.sharedCookies = true;
                    }
                }
                else {
                    this.requestFailed(data, this.cookieStatus);
                }
            }).catch((error) => {
                this.sharedCookies = false;
                this.cookieStatus.innerHTML = "Error while checking for cookies!";
                console.error('Error:', error);
            });
    }

    fetchConsent() {
        fetch(this.proxyBaseUri + "consent/", {credentials: "include"}).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.consentStatus);
            }
            return response.json();
            }).then(data => {
                if (typeof data["200"] !== "undefined") {
                    this.consents = data["200"];
                }
                else if (Array.isArray(data)) {
                    if (data.length === 0) {
                        this.consentStatus.innerHTML = "Currently you have not granted anybody access to your cookies.";
                    } else {
                        this.consents = data;
                    }
                }
                else {
                    this.requestFailed(data, this.consentStatus);
                }
            }).catch((error) => {
                this.consentStatus.innerHTML = "Error while retrieving consent information!";
                console.error('Error:', error);
            });
    }

    fetchPermissions() {
        fetch(this.proxyBaseUri + "reader/", {credentials: "include"}).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.permissionStatus);
            } else {
                return response.json();
            }
            }).then(data => {
                if (typeof data["200"] !== "undefined") {
                    this.permissions = data["200"];
                }
                else if (Array.isArray(data)) {
                    if (data.length === 0) {
                        this.permissionStatus.innerHTML = "Currently nobody has granted you non-anonymous access to their cookies.";
                    } else {
                        this.permissions = data;
                    }
                }
                else {
                    this.requestFailed(data, this.consentStatus);
                }
            })
            .catch((error) => {
                this.permissionStatus.innerHTML = "Error while retrieving permissions!";
                console.error('Error:', error);
            });
    }

    uploadCookies() {
        fetch(this.proxyBaseUri + "cookies/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: this.cookieBox.value
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.cookieStatus);
            } else {
                this.cookieStatus.innerHTML = "Successfully uploaded cookies.";
                this.requestUpdate();
            }
            }).catch((error) => {
                this.cookieStatus.innerHTML = "Uploading cookies failed!";
                console.error('Error:', error);
            });
    }

    deleteCookies() {
        fetch(this.proxyBaseUri + "cookies/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                this.newUserStatus.innerHTML = "Successfully delete cookies!";
                this.requestUpdate();
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error deleting cookies!";
                console.error('Error:', error);
            });
    }

    addUser() {
        let userId = this.newUserId.value;
        fetch(this.proxyBaseUri + "reader/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `['${userId}']`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                this.addConsent(this.newUserId.value, true);
            }
            return response.json();
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
                console.error('Error:', error);
            });
    }

    addConsent(userId, anon) {
        this.newUserId.innerHTML = "Updating consent...";
        let successCounter = 0;
        // Just send three POSTs, one for each endpoint URI
        fetch(this.proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
                console.error('Error:', error);
            });
        fetch(this.proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri + "watch"}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
                console.error('Error:', error);
            });
        fetch(this.proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri + "results"}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            return response.json();
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
                console.error('Error:', error);
            });
    }

    revokeConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Updating consent...";
        // Just send three POSTs, one for each endpoint URI
        fetch(this.proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            }
            else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                console.error('Error:', error);
            });
        fetch(this.proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri + "watch"}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                console.error('Error:', error);
            });
        fetch(this.proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{'reader': '${userId}', 'requestUri': '${this.proxyBaseUri + "results"}', 'anonymous': ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response, this.newUserStatus);
            } else {
                if (++successCounter >= 3) {
                    this.requestUpdate();
                }
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                console.error('Error:', error);
            });
        if (anon) {
            // Completely remove reader
            fetch(this.proxyBaseUri + "reader/", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: `['${userId}']`
            }).then(response => {
                if (!response.ok) {
                    this.requestFailed(response, this.newUserStatus);
                } else {
                    this.requestUpdate();
                }
                }).catch((error) => {
                    this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                    console.error('Error:', error);
                });
        }
    }

    requestFailed(response, messageContainer) {
        // if (response.status == 400 || response.status == 401) {
        //     messageContainer.innerHTML = "There was an authorization error! You are lacking the required permissions for this request.";
        // }
        // else if (response.status == 500) {
        //     messageContainer.innerHTML = "There was a server error! Please try again later.";
        // }
        // messageContainer.innerHTML = "Server not responding... Please try again later.";
        messageContainer.innerHTML = "Error: ";
        if (typeof response === "object")
            messageContainer.innerHTML += Object.values(response);
        else
            messageContainer.innerHTML += response;
    }

    // TODO map userId to user name
    parsePermission(permission) {
        return html`
            <p>${permission}</p>
        `;
    }

    // TODO map userId to user name
    parseConsent(consent) {
        // TODO change after single quotes have been removed from consent response
        consent = consent.replaceAll('\'', '"');
        //////////////////////////////////////////////////////////////////////////
        consent = JSON.parse(consent);
        return html`
            <p>${consent["reader"]}</p>
            <p>${consent["request"]}</p>
            <input type="checkbox" id="${consent["reader"] + "_deGue"}" name="${consent["reader"]}" @change=${this.setConsent} ?checked=${(consent["anonymous"] === "false")}><label for="${consent["reader"]}">De Gue View</label><br>
            <input type="button" id="${consent["reader"]}" @click=${this.deleteConsent} class="delete" value="Revoke user consent">
        `;
    }

    setConsent(event) {
        let target = event.target;
        let userId = target.name;
        let deGue = target.checked;
        if (deGue) {
            this.addConsent(userId, false);
        }
        else {
            this.revokeConsent(userId, false);
        }
    }

    deleteConsent(event) {
        let target = event.target;
        let userId = target.id;
        this.revokeConsent(userId, true);
    }

    render() {
        if (!this.sharedCookies) {
            return html`
                <h1>HyE - YouTube</h1>
                <h2>Configurations</h2>
                <i id="cookieStatus">Loading cookies...</i><br>
                <textarea id="cookieBox">Please paste your cookies here...</textarea><br>
                <input type="button" id="cookieBtn" value="Upload cookies" @click=${this.uploadCookies}>
            `;
        }
        const perms = this.permissions;
        let permissionBox = "";
        if (!this.permissions || this.permissions.length < 1) {
            permissionBox = html`
                <div class="centerBox">
                    <h3><i id="permissionStatus">Loading permissions...</i></h3>
                </div>
            `;
        }
        else {
            permissionBox = html`
                <ul>
                    ${perms.map((perm) => html`
                        <li class="ytPermItem">
                            ${this.parsePermission(perm)}
                        </li>`
                    )}
                </ul>
            `;
        }
        const conses = this.consents;
        let consentBox = "";
        if (!this.consents || this.consents.length < 1) {
            consentBox = html`
                <div class="centerBox">
                    <h3><i id="consentStatus">Loading consent data...</i></h3>
                </div>
            `;
        }
        else {
            consentBox = html`
                <ul>
                    ${conses.map((cons) => html`
                        <li class="ytConsItem">
                            ${this.parseConsent(cons)}
                        </li>`
                    )}
                </ul>
            `;
        }
        return html`
            <h1>HyE - YouTube</h1>
            <h2>Configurations</h2>
            <hr>
            <h3>The permissions granted to you by other users</h3>
            ${permissionBox}
            <hr>
            <h3>The permissions granted by you to other users</h3>
            ${consentBox}
            <input id="newUserId" type="text" placeholder="User ID"><input id="newUserBtn" type="button" value="Add new user" @click=${this.addUser}>
            <input type="button" value="Delete my cookies" @click=${this.deleteCookies} class="delete">
            <i id="newUserStatus"></i>
        `;
    }

    get consentStatus() {
        return this.renderRoot.querySelector("#consentStatus");
    }

    get permissionStatus() {
        return this.renderRoot.querySelector("#permissionStatus");
    }

    get cookieBox() {
        return this.renderRoot.querySelector("#cookieBox");
    }

    get cookieStatus() {
        return this.renderRoot.querySelector("#cookieStatus");
    }

    get newUserId() {
        return this.renderRoot.querySelector("#newUserId");
    }

    get newUserStatus() {
        return this.renderRoot.querySelector("#newUserStatus");
    }
}

window.customElements.define('config-page', ConfigPage);
