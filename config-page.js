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
            .cookie {
                display: inline-block;
                width: 30px;
                height: 30px;
                margin: 5px 5px -10px 5px;
                border-radius: 50%;
                background-image: url(https://image.flaticon.com/icons/png/512/541/541732.png);
                background-size: 30px;
            }
            .spinning {
                top: 50%;
                left: 50%;
                -webkit-animation:spin 4s linear infinite;
                -moz-animation:spin 4s linear infinite;
                animation:spin 4s linear infinite;
            }
            @-moz-keyframes spin {
                100% { -moz-transform: rotate(360deg); }
            }
            @-webkit-keyframes spin {
                100% { -webkit-transform: rotate(360deg); }
            }
            @keyframes spin {
                100% {
                    -webkit-transform: rotate(360deg);
                    transform:rotate(360deg);
                }
            }
        `;
    }

    static get properties() {
        return {
            /**
             * The base URI of the las2peer backend
             * @type {string}
             */
            las2peerBaseUri: {type: String},

            /**
             * Whether the current user has already shared their cookies
             * @type {boolean}
             */
            _sharedCookies: {type: Boolean},

            /**
             * The permissions granted by the current user
             * @type {object}
             */
            _consents: {type: Object},

            /**
             * The permissions granted to the current user
             * @type {object}
             */
            _permissions: {type: Object},
        };
    }

    constructor() {
        super();
        this.las2peerBaseUri = "http://localhost:8080/";
        this._proxyBaseUri = `${this.las2peerBaseUri}hye-youtube/`;
        this._addressbookUri = `${this.las2peerBaseUri}contactservice/addressbook/`;
        this._userData = {};
        this._sharedCookies = false;
        this._cookieBox = false;
        this._consents = {};
        this._permissions = [];
        this._addressbook = {};
        this.fetchUserdata();
        this.fetchCookies();
        this.fetchConsent();
        this.fetchPermissions();
        this.fetchAddressbook();
        this._cookieStatus = html`Loading cookies <div class="cookie spinning"></div>`;
        this._permissionStatus = html`Loading permissions <div class="cookie spinning"></div>`;
        this._consentStatus = html`Loading consent data <div class="cookie spinning"></div>`;
        this._addressbookStatus = html`Loading addressbook <div class="cookie spinning"></div>`;
        this._newUserStatus = "";
    }

    fetchUserdata() {
        fetch(this.las2peerBaseUri + "las2peer/auth/login/", {credentials: "include"}).then(response => {
            if (response.ok) {
                response.json().then(data => this._userData = data);
            } else {
                response.text().then(data => console.log("Error:", data));
            }
            }).catch((error) => {
                console.error('Error:', error);
            });
    }

    fetchCookies() {
        fetch(this._proxyBaseUri + "cookies/", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => this._cookieStatus = data);
                this.requestUpdate();
            }
            }).then(data => {
                if (!data)
                    return;
                if (data.length === 0) {
                    this._cookieStatus = "Currently you have not uploaded any valid YouTube cookies. Please do so, in order to use this service :)";
                    this._cookieBox = true;
                } else {
                    this._sharedCookies = true;
                    this._cookieStatus = "";
                }
            }).catch((error) => {
                this._sharedCookies = false;
                this._cookieStatus = "Error while checking for cookies!";
                console.error('Error:', error);
                this.requestUpdate();
            });
    }

    fetchConsent() {
        fetch(this._proxyBaseUri + "consent/", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => this._consentStatus = data);
                return;
            }
            }).then(data => {
                if (!data)
                    return
                if (data.length === 0) {
                    this._consentStatus = "Currently you have not granted anybody access to your cookies.";
                } else {
                    this._consents = this.parseConsentData(data);
                    this._consentStatus = "";
                }
                this.requestUpdate();
            }).catch((error) => {
                console.error('Error:', error);
                this._consentStatus = "Error while retrieving consent information!";
                this.requestUpdate();
            });
    }

    fetchPermissions() {
        fetch(this._proxyBaseUri + "reader/", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => this._permissionStatus = data);
                return;
            }
            }).then(data => {
                if (!data)
                    return;
                if (data.length === 0) {
                    this._permissionStatus = "Currently nobody has granted you non-anonymous access to their cookies.";
                } else {
                    this._permissions = data;
                    this._permissionStatus = "";
                }
                this.requestUpdate();
            })
            .catch((error) => {
                console.error('Error:', error);
                this._permissionStatus = "Error while retrieving permissions!";
                this.requestUpdate();
            });
    }

    fetchAddressbook() {
        fetch(this._addressbookUri, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => this._addressbookStatus = data);
                return;
            }
            }).then(data => {
                if (!data)
                    return;
                if (Object.keys(data).length === 0) {
                    this._addressbookStatus = "There are no further users in the network.";
                } else {
                    this._addressbook = data;
                    this._addressbookStatus = "";
                }
                this.requestUpdate();
            })
            .catch((error) => {
                console.error('Error:', error);
                this._addressbookStatus = "Error while retrieving addressbook!";
                this.requestUpdate();
            });
    }

    fetchUsername(userId) {
        fetch(`${this._addressbookUri}name/${userId}`, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return userId;
            }
            }).then(data => {
                return data
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    uploadCookies() {
        fetch(this._proxyBaseUri + "cookies/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: this.cookieBox.value
        }).then(response => {
            if (response.ok) {
                this.cookieStatus.innerHTML = "Successfully uploaded cookies.";
                window.location.reload(true);
            } else {
                response.json().then(data => this.cookieStatus.innerHTML = data);
            }
            }).catch((error) => {
                this.cookieStatus.innerHTML = "Uploading cookies failed!";
                console.error('Error:', error);
            });
    }

    deleteCookies() {
        this.cookieStatus.innerHTML = "Deleting cookies <div class=\"cookie spinning\">";
        fetch(this._proxyBaseUri + "cookies/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(response => {
            if (response.ok) {
                this.newUserStatus.innerHTML = "Successfully deleted cookies!";
                window.location.reload(true);
            } else {
                response.json().then(data => this.newUserStatus.innerHTML = data);
            }
            }).catch((error) => {
                this.newUserStatus.innerHTML = "Error deleting cookies!";
                console.error('Error:', error);
            });
    }

    addReader(userId) {
        this.newUserStatus.innerHTML = "Adding user <div class=\"cookie spinning\">";
        // let userId = this.newUserId.value;
        fetch(this._proxyBaseUri + "reader/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `['${userId}']`
        }).then(response => {
            if (response.ok) {
                this.addConsent(userId, true);
            } else {
                response.json().then(data => this.newUserStatus.innerHTML = data);
            }
            }).catch((error) => {
                console.error('Error:', error);
                this.newUserStatus.innerHTML = "Error while trying to add new user!";
            });
    }

    addConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Updating consent <div class=\"cookie spinning\"></div>";
        let successCounter = 0;
        // Just send three POSTs, one for each endpoint URI
        fetch(this._proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri}", "anonymous": ${anon}}`
        }).then(response => {
            if (response.ok) {
                this.newUserStatus.innerHTML = "Updating consent <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
                fetch(this._proxyBaseUri + "consent/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri + "watch"}", "anonymous": ${anon}}`
                }).then(response => {
                    if (response.ok) {
                        this.newUserStatus.innerHTML = "Updating consent <div class=\"cookie\"></div> <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
                        fetch(this._proxyBaseUri + "consent/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri + "results"}", "anonymous": ${anon}}`
                        }).then(response => {
                            if (response.ok) {
                                window.location.reload(true);
                            } else {
                                response.text().then(data => this.newUserStatus.innerHTML = data);
                            }
                        }).catch((error) => {
                            this.newUserStatus.innerHTML = "Error while trying to add new user!";
                            console.error('Error:', error);
                        });
                    } else {
                        response.text().then(data => this.newUserStatus.innerHTML = data);
                    }
                }).catch((error) => {
                    this.newUserStatus.innerHTML = "Error while trying to add new user!";
                    console.error('Error:', error);
                });
            } else {
                response.text().then(data => this.newUserStatus.innerHTML = data);
            }
        }).catch((error) => {
            this.newUserStatus.innerHTML = "Error while trying to add new user!";
            console.error('Error:', error);
        });
    }

    revokeConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie spinning\"></div>";
        // Just send three POSTs, one for each endpoint URI
        fetch(this._proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri}", "anonymous": ${anon}}`
        }).then(response => {
            if (response.ok) {
                this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
                fetch(this._proxyBaseUri + "consent/", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri + "watch"}", "anonymous": ${anon}}`
                }).then(response => {
                    if (response.ok) {
                        this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie\"></div> <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
                        fetch(this._proxyBaseUri + "consent/", {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri + "results"}", "anonymous": ${anon}}`
                        }).then(response => {
                            if (response.ok) {
                                if (anon) {
                                    this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie\"></div> <div class=\"cookie\"></div> <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
                                    // Completely remove reader
                                    fetch(this._proxyBaseUri + "reader/", {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        credentials: "include",
                                        body: `["${userId}"]`
                                    }).then(response => {
                                        if (response.ok) {
                                            window.location.reload(true);
                                        } else {
                                            response.text().then(data => this.newUserStatus.innerHTML = data);
                                        }
                                    }).catch((error) => {
                                        this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                                        console.error('Error:', error);
                                    });
                                }
                                else {
                                    window.location.reload(true);
                                }
                            } else {
                                response.text().then(data => this.newUserStatus.innerHTML = data);
                            }
                        }).catch((error) => {
                            this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                            console.error('Error:', error);
                        });
                    } else {
                        response.text().then(data => this.newUserStatus.innerHTML = data);
                    }
                }).catch((error) => {
                    this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
                    console.error('Error:', error);
                });
            }
            else {
                response.text().then(data => this.newUserStatus.innerHTML = data);
            }
        }).catch((error) => {
            this.newUserStatus.innerHTML = "Error while trying to revoke consent!";
            console.error('Error:', error);
        });
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

    parsePermission(permission) {
        return (typeof this._addressbook[permission] === "undefined")
            ? html`<p>${this.fetchUsername(permission)}</p>`
            : html`<p>${this._addressbook[permission]}</p>
        `;
    }

    parseConsent(readerId) {
        return html`${(typeof this._addressbook[readerId] === "undefined")
            ? html`<p>${this.fetchUsername(readerId)}</p>`
            : html`<p>${this._addressbook[readerId]}</p>
            `}
            <input type="checkbox" id="${readerId + "_deGue"}" name="${readerId}" @change=${this.setConsent} ?checked=${!this._consents[readerId]}><label for="${readerId}">De Gue View</label><br>
            <input type="button" id="${readerId}" @click=${this.deleteConsent} class="delete" value="Revoke user consent">
        `;
    }

    parseUserId(userId) {
        return (typeof this._consents[userId] !== "undefined" || this._userData["agentid"] === userId)
            ? ``
            : html`
                <li class="l2pUser">
                    <p>${this._addressbook[userId]}</p>
                    <input type="button" id="${userId}" @click=${this.grantAccess} value="Grant cookie access">
                </li>
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

    grantAccess(event) {
        let target = event.target;
        let userId = target.id;
        this.addReader(userId);
    }

    render() {
        return this._sharedCookies
            ? html`
                <h2>Configurations</h2>
                <hr>
                <h3>The permissions granted to you by other users</h3>
                <div class="centerBox">
                    <h3><i id="permissionStatus">${this._permissionStatus}</i></h3>
                </div>
                <ul>
                    ${this._permissions.map((perm) => html`
                        <li class="ytPermItem">
                            ${this.parsePermission(perm)}
                        </li>`
                    )}
                </ul>
                <hr>
                <h3>The permissions granted by you to other users</h3>
                <div class="centerBox">
                    <h3><i id="consentStatus">${this._consentStatus}</i></h3>
                </div>
                <ul>
                    ${Object.keys(this._consents).map((readerId) => html`
                        <li class="ytConsItem">
                            ${this.parseConsent(readerId)}
                        </li>`
                    )}
                </ul>
                <!---<input id="newUserId" type="text" placeholder="User ID"><input id="newUserBtn" type="button" value="Add new user" @click=${this.addReader}>--->
                <i id="newUserStatus">${this._newUserStatus}</i>
                <h3><i id="addressbookStatus">${this._addressbookStatus}</i></h3>
                <ul>
                    ${Object.keys(this._addressbook).map((userId) => this.parseUserId(userId))}
                </ul>
                <input type="button" value="Delete my cookies" @click=${this.deleteCookies} class="delete">
                <i id="cookieStatus">${this._cookieStatus}</i>`
            : ( this._cookieBox
                ? html`
                    <h2>Configurations</h2>
                    <i id="cookieStatus">${this._cookieStatus}</i><br>
                    <textarea id="cookieBox">Please paste your cookies here...</textarea><br>
                    <input type="button" id="cookieBtn" value="Upload cookies" @click=${this.uploadCookies}>`
                : html`
                    <h2>Configurations</h2>
                    <i id="cookieStatus">${this._cookieStatus}</i><br>`
            );
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

    get addressbookStatus() {
        return this.renderRoot.querySelector("#addressbookStatus");
    }
}

window.customElements.define('config-page', ConfigPage);
