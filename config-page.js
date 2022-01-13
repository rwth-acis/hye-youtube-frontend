/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * The HyE - YouTube configuration page
 */

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
        this.consents = {};
        this.permissions = [];
        this.fetchCookies();
        this.fetchConsent();
        this.fetchPermissions();
    }

    fetchCookies() {
        fetch(this.proxyBaseUri + "cookies/", {credentials: "include"}).then(response => {
            if (!response.ok) {
                this.requestFailed(response.statusText, this.cookieStatus);
            } else {
                return response.json();
            }
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
                this.requestFailed(response.statusText, this.consentStatus);
            } else {
                return response.json();
            }
            }).then(data => {
                if (typeof data["200"] !== "undefined") {
                    this.consents = data["200"];
                }
                else if (Array.isArray(data) || typeof data === "string") {
                    if (data.length === 0) {
                        this.consentStatus.innerHTML = "Currently you have not granted anybody access to your cookies.";
                    } else {
                        this.consents = this.parseConsentData(data);
                    }
                }
                else {
                    this.requestFailed(data, this.consentStatus);
                }
            }).catch((error) => {
                console.error('Error:', error);
                this.consentStatus.innerHTML = "Error while retrieving consent information!";
            });
    }

    fetchPermissions() {
        fetch(this.proxyBaseUri + "reader/", {credentials: "include"}).then(response => {
            if (!response.ok) {
                this.requestFailed(response.statusText, this.permissionStatus);
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
                console.error('Error:', error);
                this.permissionStatus.innerHTML = "Error while retrieving permissions!";
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
                this.requestFailed(response.statusText, this.cookieStatus);
            } else {
                this.cookieStatus.innerHTML = "Successfully uploaded cookies.";
                window.location.reload(true);
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
                this.requestFailed(response.statusText, this.newUserStatus);
            } else {
                this.newUserStatus.innerHTML = "Successfully delete cookies!";
                window.location.reload(true);
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error deleting cookies!";
                console.error('Error:', error);
            });
    }

    addUser() {
        this.newUserStatus.innerHTML = "Adding user <i class='fa fa-spinner fa-pulse'></i>";
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
                this.requestFailed(response.statusText, this.newUserStatus);
            } else {
                this.addConsent(this.newUserId.value, true);
            }
            }).catch((error) => {
                console.error('Error:', error);
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
            });
    }

    addConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Updating consent <i class='fa fa-spinner fa-pulse'></i>";
        let successCounter = 0;
        // Just send three POSTs, one for each endpoint URI
        fetch(this.proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri}", "anonymous": ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response.statusText, this.newUserStatus);
            } else {
                fetch(this.proxyBaseUri + "consent/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri + "watch"}", "anonymous": ${anon}}`
                }).then(response => {
                    if (!response.ok) {
                        this.requestFailed(response.statusText, this.newUserStatus);
                    } else {
                        fetch(this.proxyBaseUri + "consent/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri + "results"}", "anonymous": ${anon}}`
                        }).then(response => {
                            if (!response.ok) {
                                this.requestFailed(response.statusText, this.newUserStatus);
                            } else {
                                window.location.reload(true);
                            }
                            return response.json();
                        }).catch((error) => {
                            this.newUserStatus.innerHTML = "Error while trying to add new user!";
                            console.error('Error:', error);
                        });
                    }
                }).catch((error) => {
                    this.newUserStatus.innerHTML = "Error while trying to add new user!";
                    console.error('Error:', error);
                });
            }
        }).catch((error) => {
            this.newUserStatus.innerHTML = "Error while trying to add new user!";
            console.error('Error:', error);
        });
    }

    revokeConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Revoking consent <i class='fa fa-spinner fa-pulse'></i>";
        // Just send three POSTs, one for each endpoint URI
        fetch(this.proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri}", "anonymous": ${anon}}`
        }).then(response => {
            if (!response.ok) {
                this.requestFailed(response.statusText, this.newUserStatus);
            }
            else {
                fetch(this.proxyBaseUri + "consent/", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri + "watch"}", "anonymous": ${anon}}`
                }).then(response => {
                    if (!response.ok) {
                        this.requestFailed(response.statusText, this.newUserStatus);
                    } else {
                        fetch(this.proxyBaseUri + "consent/", {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: `{"reader": "${userId}", "requestUri": "${this.proxyBaseUri + "results"}", "anonymous": ${anon}}`
                        }).then(response => {
                            if (!response.ok) {
                                this.requestFailed(response.statusText, this.newUserStatus);
                            } else {
                                if (anon) {
                                    // Completely remove reader
                                    fetch(this.proxyBaseUri + "reader/", {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        credentials: "include",
                                        body: `["${userId}"]`
                                    }).then(response => {
                                        if (!response.ok) {
                                            this.requestFailed(response.statusText, this.newUserStatus);
                                        } else {
                                            window.location.reload(true);
                                        }
                                    }).catch((error) => {
                                        this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                                        console.error('Error:', error);
                                    });
                                }
                                else {
                                    window.location.reload(true);
                                }
                            }
                        }).catch((error) => {
                            this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                            console.error('Error:', error);
                        });
                    }
                }).catch((error) => {
                    this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                    console.error('Error:', error);
                });
            }
        }).catch((error) => {
            this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
            console.error('Error:', error);
        });
    }

    requestFailed(response, messageContainer) {
        response.json().then(obj => this.status.innerHTML = JSON.stringify(obj));
    }

    parseConsentData(data) {
        let result = {};
        data.forEach((consentItem) => {
            consentItem = JSON.parse(consentItem);
            if (typeof result[consentItem["reader"]] === "undefined")
                result[consentItem["reader"]] = (consentItem["anonymous"] === "true");
            else
                result[consentItem["reader"]] &= (consentItem["anonymous"] === "true");
        });
        return result;
    }

    // TODO map userId to user name
    parsePermission(permission) {
        return html`
            <p>${permission}</p>
        `;
    }

    // TODO map userId to user name
    parseConsent(readerId) {
        return html`
            <p>${readerId}</p>
            <input type="checkbox" id="${readerId + "_deGue"}" name="${readerId}" @change=${this.setConsent} ?checked=${!this.consents[readerId]}><label for="${readerId}">De Gue View</label><br>
            <input type="button" id="${readerId}" @click=${this.deleteConsent} class="delete" value="Revoke user consent">
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
                <h2>Configurations</h2>
                <i id="cookieStatus">Loading cookies <i class="fa fa-spinner fa-pulse"></i></i><br>
                <textarea id="cookieBox">Please paste your cookies here...</textarea><br>
                <input type="button" id="cookieBtn" value="Upload cookies" @click=${this.uploadCookies}>
            `;
        }
        const perms = this.permissions;
        let permissionBox = "";
        if (!this.permissions || this.permissions.length < 1) {
            permissionBox = html`
                <div class="centerBox">
                    <h3><i id="permissionStatus">Loading permissions <i class="fas fa-spinner fa-pulse"></i></i></h3>
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
        let consentBox = "";
        if (!this.consents || Object.keys(this.consents).length < 1) {
            consentBox = html`
                <div class="centerBox">
                    <h3><i id="consentStatus">Loading consent data <i class="fas fa-spinner fa-pulse"></i></i></h3>
                </div>
            `;
        }
        else {
            const readerIds = Object.keys(this.consents);
            consentBox = html`
                <ul>
                    ${readerIds.map((readerId) => html`
                        <li class="ytConsItem">
                            ${this.parseConsent(readerId)}
                        </li>`
                    )}
                </ul>
            `;
        }
        return html`
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
