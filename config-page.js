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
                padding-bottom: 50px;
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
                border: 2px red solid;
                max-height: 50px;
            }
            input[type="button"].delete:hover {
                font-weight: bold;
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
            .avatar {
                border-radius: 50%;
                height: 40px;
                width: 40px;
                vertical-align: middle;
                display: inline-block;
                overflow: hidden;
            }
            .collapsed {
                max-height: 0px;
            }
            .clickBar {
                height: 20px;
                width: 90%;
                display: inline-block;
                box-shadow: 1px 2px 1px grey;
                border: 1px solid lightgrey;
                font-size: small;
                padding: 1px 1px 1px 1em;
            }
            .clickBar:hover {
                background-color: lightgrey;
                cursor: pointer;
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
            #avatar {
                min-width: 40px;
                min-height: 40px;
            }
            #alpha {
                vertical-align: middle;
            }
            #customRecs {
                width: 90%;
                padding: 0px 5%;
            }
            #collapsable {
                width: 90%;
                padding: 10px 5% 0px 5%;
                transition: max-height 1s ease-in;
                -webkit-transition: max-height 1s ease-in;
                -moz-transition: max-height 1s ease-in;
                -o-transition: max-height 1s ease-in;
                overflow: hidden;
            }
            #loginBtn {
                margin-right: 1em;
            }
            #customRecStatus {
                display: inline-block;
                padding: 10px 0px;
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
        this._recsBaseUri = `${this.las2peerBaseUri}hye-recommendations/`;
        this._proxyBaseUri = `${this.las2peerBaseUri}hye-youtube/`;
        this._contactserviceUri = `${this.las2peerBaseUri}contactservice/`;
        this._addressbookUri = `${this.las2peerBaseUri}contactservice/addressbook/`;
        this._userData = {};
        this._sharedCookies = false;
        this._cookieBox = false;
        this._consents = {};
        this._permissions = [];
        this._addressbook = {};
        this._deGue = "";
        this._avatars = {};
        this._alpha = -1;
        this.fetchAddressbook();
        this.fetchUserdata();
        this.fetchCookies();
        this.fetchPreference();
        this.fetchAlpha();
        this.fetchConsent();
        this.fetchPermissions();
        this._cookieStatus = html`Loading cookies <div class="cookie spinning"></div>`;
        this._permissionStatus = html`Loading permissions <div class="cookie spinning"></div>`;
        this._consentStatus = html`Loading consent data <div class="cookie spinning"></div>`;
        this._addressbookStatus = html`Loading addressbook <div class="cookie spinning"></div>`;
        this._newUserStatus = "";
        this._recStatus = "";
    }

    fetchUserdata() {
        fetch(this.las2peerBaseUri + "las2peer/auth/login/", {credentials: "include"}).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    this._userData = data;
                });
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
                      this._sharedCookies = false;
                      this._cookieStatus = data;
                      this.cookieStatus.innerHTML = this._cookieStatus;
                      if (data !== "Could not get execution context. Are you logged in?")
                          this._cookieBox = true;
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
            this.requestUpdate();
        }).catch((error) => {
            this._sharedCookies = false;
            console.error('Error:', error);
            this._cookieStatus = "Error while checking for cookies!";
            this.cookieStatus.innerHTML = this._cookieStatus;
        });
    }

    fetchAddressbook() {
        fetch(this._addressbookUri, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => {
                    this._addressbookStatus = JSON.stringify(data);
                    this.addressbookStatus.innerHTML = this._addressbookStatus;
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
            this.addressbookStatus.innerHTML = this._addressbookStatus;
            this.requestUpdate();
            return this._addressbook;
        }).catch((error) => {
            if (error.name == "TypeError")
            	return;
            console.error('Error:', error);
            this._addressbookStatus = "Error while retrieving addressbook!";
            this.addressbookStatus.innerHTML = this._addressbookStatus;
        });
    }

    fetchPreference() {
        fetch(this._proxyBaseUri + "preference", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            }
        }).then(data => {
            this._deGue = data.replaceAll('"', '');
            return this._deGue;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    fetchPermissions() {
        fetch(this._proxyBaseUri + "reader/", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => {
                    this._permissionStatus = JSON.stringify(data);
                    this.permissionStatus.innerHTML = this._permissionStatus;
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
            this.permissionStatus.innerHTML = this._permissionStatus;
            this.requestUpdate();
            return this._permissions;
        })
        .catch((error) => {
            if (error.name == "TypeError")
            	return;
            console.error('Error:', error);
            this._permissionStatus = "Error while retrieving permissions!";
            this.permissionStatus.innerHTML = this._permissionStatus;
        });
    }

    fetchConsent() {
        fetch(this._proxyBaseUri + "consent/", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                response.json().then(data => {
                    this._consentStatus = JSON.stringify(data);
                    this.consentStatus.innerHTML = this._consentStatus;
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
            this.consentStatus.innerHTML = this._consentStatus;
            this.requestUpdate();
            return this._consents;
        }).catch((error) => {
            if (error.name == "TypeError")
            	return;
            console.error('Error:', error);
            this._consentStatus = "Error while retrieving consent information!";
            this.consentStatus.innerHTML = this._consentStatus;
        });
    }

    fetchAlpha() {
        // If alpha has already been updated, no need to send request again
        if (this._alpha !== -1)
            return this._alpha;
        fetch(this._recsBaseUri + "alpha", {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            }
        }).then(data => {
            if (!data)
                return -1;
            this._alpha = data * 100;
            this.requestUpdate();
            return this._alpha;
        }).catch((error) => {
            console.error('Error:', error);
            return -1;
        });
    }

    fetchUsername(userId) {
        if (typeof this._addressbook[userId] !== "undefined")
            return this._addressbook[userId];
        fetch(`${this._contactserviceUri}name/${userId}`, {credentials: "include"}).then(response => {
            if (response.ok) {
                return response.text();
            }
        }).then(data => {
            if (!data)
                return userId;
            this._addressbook[userId] = data;
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
            return userId;
        });
    }

    fetchAvatar(userName) {
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
            body: `["${userId}"]`
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
                if (anon)
                    window.location.reload(true);
                else {
                    this.newUserStatus.innerHTML = "Consent Successfully updated.";
                }
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
                    this.customRecs.setAttribute("hidden", '');
                    this.uploadArea.setAttribute("hidden", '');
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
                    if (this._alpha > 0)
                        this.customRecs.removeAttribute("hidden");
                    this.uploadArea.removeAttribute("hidden");
                });
            } else {
                response.text().then(data => {this.permissionStatus.innerHTML = data});
            }
        }).catch((error) => {
            this.permissionStatus.innerHTML = "Error while trying to reset recommendation settings!";
            console.error('Error:', error);
        });
    }

    updateAlpha() {
        fetch(this._recsBaseUri + "alpha/", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            credentials: "include",
            body: this.alpha.value / 100
        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    synchronizeData() {
        this._recStatus = "Started to synchronize data. This is going to take a couple of minutes... " +
                    "You can continue to use the service. Once the update is done, this area of the config page is going to be replaced " +
                    "with settings where you can influence your recommendations.";
        this.customRecStatus.innerHTML = this._recStatus;
        fetch(this._recsBaseUri, {
            method: "POST",
            credentials: "include"
        }).then((response) => {
            if (response.ok) {
                this._recStatus = "Synchronization successful!";
                this.customRecStatus.innerHTML = this._recStatus;
            }
            else
                response.text().then(data => {
		    if (typeof data["msg"] !== "undefined")
		        data = data["msg"];
                    this._recStatus = data;
                    this.customRecStatus.innerHTML = this._recStatus;
                });
        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    parseCookies(cookieString) {
        let placeHolderText = "Please paste your cookies here...";
        if (cookieString.startsWith(placeHolderText))
            cookieString = cookieString.substr(placeHolderText.length, cookieString.length);
        let cookies = "";
        try {
            cookies = JSON.parse(cookieString);
        } catch (e) {
            this.cookieStatus.innerHTML = "Invalid cookie data!";
            return {};
        }
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

    getUserInfo(userId) {
        const userName = this.fetchUsername(userId);
        const avatarLink = this.fetchAvatar(userName);
        return html`
            <div class="userInfo">
                <div class="avatar">
                    <img id="avatar" src="${avatarLink}" />
                </div>
                <p id="username">${userName}</p>
            </div>
        `;
    }

    permissionEntry(userId) {
        return html`
            <input id="${userId}" name="deGue" type="radio" @change=${this.setUserPreference} ?checked=${this._deGue === userId}>
            ${this.getUserInfo(userId)}
        `;
    }

    consentEntry(userId) {
        const userName = this.fetchUsername(userId);
        const avatarLink = this.fetchAvatar(userName);
        return html`
            <div class="userInfo">
                <div class="avatar" style="vertical-align: baseline;">
                    <img id="avatar" src="${avatarLink}" />
                </div>
                <div class="consentData">
                    <p id=userName>${userName}</p>
                    <input type="checkbox" id="${userId + "_deGue"}" name="${userId}" @change=${this.setConsent} ?checked=${!this._consents[userId]}>
                    <label class="small" for="${userId}">Permit non-anonymous requests</label>
                </div>
            </div>
            <input type="button" id="${userId}" @click=${this.deleteConsent} class="delete grantBtn" value="Revoke user consent">
        `;
    }

    addressbookEntry(userId) {
        return (typeof this._consents[userId] !== "undefined" || this._userData["agentid"] === userId)
            ? ``
            : html`
                <input type="button" name="${userId}" class="grantBtn" @click=${this.grantAccess} value="Grant cookie access">
                ${this.getUserInfo(userId)}
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
        // Edge
        if (window.navigator.userAgent.indexOf("Edge") > -1)
            return "https://microsoftedge.microsoft.com/addons/detail/cookie-editor/ajfboaconbpkglpfanbmlfgojgndmhmc";
        // Chrome (All chromium based browsers should also work)
        if (navigator.userAgent.indexOf("Chrome") > -1)
            return "https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm";
        // Everything else must be Firefox
        return "https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/";
    }

    toggleUploadArea() {
        this.collapsable.classList.toggle("collapsed");
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
                    <div id="uploadArea" ?hidden=${this._deGue != ""}>
                        <span class="clickBar" @click=${this.toggleUploadArea}>Upload YouTube history</span>
                        <div id="collapsable" class=${this._alpha < 0 ? "" : "collapsed"}>
                            <p>Please use the buttons below to sign into YouTube and then share upload your YouTube history to receive custom recommendations</p>
                            <div class="buttonBox">
                                <a id="ytLink" target="_blank" href="${this._recsBaseUri + "login"}"><input type="button" id="loginBtn" value="YouTube login"></a>
                                <input type="button" id="synchBtn" value="Upload watch data" @click=${this.synchronizeData}>
                            </div>
                        </div>
                    </div>
                    <div id="customRecs" ?hidden=${this._deGue != "" || this._alpha < 0}>
                        <p><b>Custom recommendations</b></p>
                        <p>Set how different the recommendation mix should be from your normal recommendations</p>
                        <label for="alpha">Similar</label>
                        <input id="alpha" type="range" min="0" max="100" value="${this._alpha}" class="slider" @change=${this.updateAlpha}>
                        <label for="mixed">Different</label><br />
                        <i id="customRecStatus">${this._recStatus}</i>
                    </div>
                    ${this._permissions.length > 0 ?
                        html`<b>Get exclusive recommendations for user</b>` : ``}
                    ${this._permissions.map((perm) => html`
                        <li class="ytPermItem">
                            ${this.permissionEntry(perm)}
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
                            ${this.consentEntry(readerId)}
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
                    ${Object.keys(this._addressbook).map((userId) => html`
                        <li class="l2pUser">
                            ${this.addressbookEntry(userId)}
                        </li>`
                    )}
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
                        <textarea placeholder="Please paste your cookies here..." id="cookieBox"></textarea><br>
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

    get customRecStatus() {
        return this.renderRoot.querySelector("#customRecStatus");
    }

    get alpha() {
        return this.renderRoot.querySelector("#alpha");
    }

    get customRecs() {
        return this.renderRoot.querySelector("#customRecs");
    }

    get uploadArea() {
        return this.renderRoot.querySelector("#uploadArea");
    }

    get collapsable() {
        return this.renderRoot.querySelector("#collapsable");
    }
}

window.customElements.define('config-page', ConfigPage);
