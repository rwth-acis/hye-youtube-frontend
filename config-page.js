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
                width: 800px;
                font-family: sans-serif;
                position: absolute;
                left: 50%;
                margin-left: -416px;
            }
            body {
                font-family: sans-serif;
            }
            input {
                border-radius: 0;
                background-color: inherit;
            }
            input[type="button"] {
                background-color: cornflowerblue;
                border: none;
                padding: 1em;
            }
            input[type="button"]:hover {
                cursor: pointer;
                color: white;
            }
            ul {
                padding: 0px;
                list-style-type: none;
            }
            input[type="button"].delete {
                background-color: red;
                color: #FFF;
                font-weight: bold;
                border: 2px red solid;
                max-height: 50px;
            }
            input[type="button"].disabled {
                background-color: lightgrey;
                color: darkgrey;
            }
            input[type="button"].disabled:hover {
                cursor: initial;
            }
            img {
                height: 100%;
            }
            .centerBox {
                position: inline-block;
                justify-content: center;
                display: flex;
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
            .small {
                font-size: small;
            }
            .ytConsItem {
                display: flow-root;
                margin-bottom: 10px;
            }
            .consentData {
                display: inline-block;
                padding-right: 3em;
            }
            .grantBtn {
                float: right;
            }
            .userInfo {
                display: inline;
            }
            .buttonBox {
                display: flex;
                width: 100%;
            }
            .ytPermItem {
                padding: 10px;
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
            #configBox {
                width: 300px;
                height: 500px;
            }
            #cookieBox {
                width: 97%;
                height: 85%;
            }
            #username {
                display: inline-block;
            }
            .avatar {
                border-radius: 50%;
                height: 40px;
                width: 40px;
                vertical-align: middle;
                display: inline-block;
            }
            #cookieBtn {
                width: 50%;
                margin-left: 8px;
            }
            #pluginLink {
                width: 50%;
            }
            #pluginBtn {
                width: 100%;
            }
            #userName {
                margin: 0px 0px 5px 5px;
            }
            @media screen and (max-width: 800px) {
                :host {
                    display: block;
                    border: solid 1px gray;
                    width: 360px;
                    font-family: sans-serif;
                    position: absolute;
                    left: 50%;
                    margin-left: -196px;
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
        this.las2peerBaseUri = "http://localhost:8081/";
        this._proxyBaseUri = `${this.las2peerBaseUri}hye-youtube/`;
        this._addressbookUri = `${this.las2peerBaseUri}contactservice/addressbook/`;
        this._userData = {};
        this._sharedCookies = false;
        this._cookieBox = false;
        this._consents = {};
        this._permissions = [];
        this._addressbook = {};
        this._deGue = "";
        this._avatars = {};
        this.fetchUserdata();
        this.fetchCookies();
        this.fetchConsent();
        this.fetchPermissions();
        this.fetchAddressbook();
        this.fetchPreference();
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
                return response.text();
            } else {
                response.text()
                  .then(data => {
                    this._cookieStatus = data;
                    this.requestUpdate();
                  })
                  .catch((error) => {
                      this._sharedCookies = false;
                      this._cookieStatus = "Error while checking for cookies!";
                      console.error('Error:', error);
                      this.requestUpdate();
                });
            }
            }).then(data => {
                if (!data)
                    return;
                if (data === "No cookies found.") {
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
                response.json().then(data => {
                    this._consentStatus = JSON.stringify(data);
                    this.requestUpdate();
                });
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
                response.json().then(data => {
                    this._permissionStatus = JSON.stringify(data);
                    this.requestUpdate();
                });
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
                response.json().then(data => {
                    this._addressbookStatus = JSON.stringify(data);
                    this.requestUpdate();
                });
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
        if (typeof this._addressbook[userId] !== "undefined")
            return this._addressbook[userId];
        fetch(`${this._addressbookUri}name/${userId}`, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return userId;
            }
            }).then(data => {
                this._addressbook[userId] = data;
                return data
            })
            .catch((error) => {
                console.error('Error:', error);
                return userId;
            });
    }

    fetchPreference() {
        fetch(this._proxyBaseUri + "preference", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            }
            }).then(data => {
                this._deGue = data.replaceAll('"', '');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    fetchAvatar(userName) {
        if (typeof userName === "undefined")
            return "https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png";
        if (typeof this._avatars[userName] !== "undefined")
            return this._avatars[userName];
        fetch(this.las2peerBaseUri + "contactservice/user/" + userName, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            }
            }).then(data => {
                if (!data)
                    return "https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png";
                let strPart = data.split("userImage=")[1];
                let avatarId = strPart.substr(0, strPart.length-1);
                if (avatarId === "")
                    return "https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png";
                let avatarLink = this.las2peerBaseUri + "fileservice/files/" + avatarId;
                this._avatars[userName] = avatarLink;
                this.requestUpdate();
                return avatarLink;
            }).catch((error) => {
                console.error('Error:', error);
                return "https://raw.githubusercontent.com/rwth-acis/las2peer-frontend-user-widget/master/logo.png";
            });
    }

    uploadCookies() {
        fetch(this._proxyBaseUri + "cookies/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: this.parseCookies(this.cookieBox.value)
        }).then(response => {
            if (response.ok) {
                this.cookieStatus.innerHTML = "Successfully uploaded cookies.";
                window.location.reload(true);
            } else {
                response.text().then(data => this.cookieStatus.innerHTML = data);
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
        fetch(this._proxyBaseUri + "consent/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri}", "anonymous": ${anon}}`
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
    }

    revokeConsent(userId, anon) {
        this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie spinning\"></div>";
        fetch(this._proxyBaseUri + "consent/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: `{"reader": "${userId}", "requestUri": "${this._proxyBaseUri}", "anonymous": ${anon}}`
        }).then(response => {
            if (response.ok) {
                if (anon) {
                    this.newUserStatus.innerHTML = "Revoking consent <div class=\"cookie\"></div> <div class=\"cookie spinning\"></div>";
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
    }

    updatePreference(userId) {
        this.permissionStatus.innerHTML = "Updating recommendation settings <div class=\"cookie spinning\"></div>";
        fetch(this._proxyBaseUri + "preference/", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            credentials: "include",
            body: `${userId}`
        }).then(response => {
            if (response.ok) {
                response.text().then(data => {
                    this.permissionStatus.innerHTML = data;
                    window.location.reload(true);
                });
            } else {
                response.text().then(data => {this.permissionStatus.innerHTML = data});
            }
        }).catch((error) => {
            this.permissionStatus.innerHTML = "Error while trying to update recommendation settings!";
            console.error('Error:', error);
        });
    }

    resetPreference() {
        this.permissionStatus.innerHTML = "Resetting recommendation settings <div class=\"cookie spinning\"></div>";
        fetch(this._proxyBaseUri + "preference/", {method: "DELETE", credentials: "include"
        }).then(response => {
            if (response.ok) {
                response.text().then(data => {
                    this.permissionStatus.innerHTML = data;
                    window.location.reload(true);
                });
            } else {
                response.text().then(data => {this.permissionStatus.innerHTML = data});
            }
        }).catch((error) => {
            this.permissionStatus.innerHTML = "Error while trying to reset recommendation settings!";
            console.error('Error:', error);
        });
    }

    parseCookies(cookieString) {
        let placeHolderText = "Please paste your cookies here...";
        if (cookieString.startsWith(placeHolderText))
            cookieString = cookieString.substr(placeHolderText.length, cookieString.length);
        let cookies = JSON.parse(cookieString);
        let result = [];
        if (typeof cookies !== "object" || typeof cookies.length === "undefined")
            return;
        for (let i = 0; i < cookies.length; ++i) {
            let cookie = cookies[i];
            if (!(typeof cookie["name"] === "undefined" || typeof cookie["value"] === "undefined" ||
              // Cookies starting with 'st-' seem to cause problems in authentication
              cookie["name"].startsWith("ST-")))
                // We just care about name and value
                result.push({"name": cookie["name"], "value": cookie["value"]});
        }
        return JSON.stringify(result);
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
        let userName = this.fetchUsername(permission);
        let avatarLink = this.fetchAvatar(userName);
        return html`
            <div class="userInfo">
                <div class="avatar">
                    <img src="${avatarLink}" />
                </div>
                <p id="username">${userName}</p>
            </div>
            <input id="${permission}" name="deGue" type="radio" @change=${this.setUserPreference} ?checked=${this._deGue === permission}>
        `;
    }

    parseConsent(readerId) {
        let userName = this.fetchUsername(readerId);
        let avatarLink = this.fetchAvatar(userName);
        return html`
            <div class="userInfo">
                <div class="avatar" style="vertical-align: baseline;">
                    <img src="${avatarLink}" />
                </div>
                <div class="consentData">
                    <p id=userName>${userName}</p>
                    <input type="checkbox" id="${readerId + "_deGue"}" name="${readerId}" @change=${this.setConsent} ?checked=${!this._consents[readerId]}>
                    <label class="small" for="${readerId}">Permit non-anonymous requests</label>
                </div>
            </div>
            <input type="button" id="${readerId}" @click=${this.deleteConsent} class="delete grantBtn" value="Revoke user consent">
        `;
    }

    parseUserId(userId) {
        let userName = this.fetchUsername(userId);
        let avatarLink = this.fetchAvatar(userName);
        return (typeof this._consents[userId] !== "undefined" || this._userData["agentid"] === userId)
            ? ``
            : html`
                <input type="button" name="${userId}" class="grantBtn" @click=${this.grantAccess} value="Grant cookie access">
                <li class="l2pUser">
                    <div class="avatar">
                        <img src="${avatarLink}" />
                    </div>
                    <p id="username">${userName}</p>
                </li>
        `;
    }

    setUserPreference(event) {
        let target = event.target;
        let userId = target.id;
        this.updatePreference(userId);
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
        let userId = target.name;
        this.addReader(userId);
    }
    
    getPluginLink() {
        // Not chrome -> Assume Firefox
        if (navigator.userAgent.indexOf("Chrome") === -1)
            return "https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/";
        // Chrome
        return "https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm";
    }
    

    render() {
        return this._sharedCookies
            ? html`
                <h2>Configurations</h2>
                <hr>
                <h3>Configure recommendations</h3>
                <ul id="deGueList">
                    <li class="ytPermItem">
                        <input id="mixed" type="radio" name="deGue" @change=${this.resetPreference} ?checked=${this._deGue === ""}>
                        <label for="mixed">Mixed recommendations</label>
                    </li>
                    ${this._permissions.length > 0 ?
                        html`<b>Get exclusive recommendations for user</b>` : ``}
                    ${this._permissions.map((perm) => html`
                        <li class="ytPermItem">
                            ${this.parsePermission(perm)}
                        </li>`
                    )}
                </ul>
                <div class="centerBox">
                    <i id="permissionStatus">${this._permissionStatus}</i>
                </div>
                <hr>
                <h3>The permissions granted by you to other users</h3>
                <ul>
                    ${Object.keys(this._consents).map((readerId) => html`
                        <li class="ytConsItem">
                            ${this.parseConsent(readerId)}
                        </li>`
                    )}
                </ul>
                <div class="centerBox">
                    <i id="consentStatus">${this._consentStatus}</i>
                </div>
                <hr>
                <h3>Addressbook</h3>
                <!---<input id="newUserId" type="text" placeholder="User ID"><input id="newUserBtn" type="button" value="Add new user" @click=${this.addReader}>--->
                <ul>
                    ${Object.keys(this._addressbook).map((userId) => this.parseUserId(userId))}
                </ul>
                <i id="newUserStatus">${this._newUserStatus}</i>
                <i id="addressbookStatus">${this._addressbookStatus}</i>
                <hr>
                <input type="button" value="Delete my cookies" @click=${this.deleteCookies} class="delete">
                <i id="cookieStatus">${this._cookieStatus}</i>`
            : ( this._cookieBox
                ? html`
                    <h2>Configurations</h2>
                    <div id="configBox">
                        <i id="cookieStatus">${this._cookieStatus}</i><br>
                        <textarea id="cookieBox">Please paste your cookies here...</textarea><br>
                        <div class="buttonBox">
                            <a id="pluginLink" target="_blank" href="${this.getPluginLink()}"><input type="button" id="pluginBtn" value="Get YouTube Cookies"></a>
                            <input type="button" id="cookieBtn" value="Upload cookies" @click=${this.uploadCookies}>
                        </div>
                    </div>`
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
