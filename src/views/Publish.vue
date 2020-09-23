<template>
  <div class="container" style="margin-top: 40px">
    <vue-headful
      title="Scrypta Decentralized News Feed"
      description="Read articles from trusted sources."
    />
    <b-modal
      v-model="passwordShow"
      hide-footer
      title="Write news on the blockchain"
    >
      <b-form-input
        v-if="!isUploading"
        v-model="unlockPwd"
        type="password"
        placeholder="Enter wallet password"
      ></b-form-input
      ><br />
      <div
        v-if="!isUploading"
        @click.prevent="unlockWallet"
        class="btn btn-primary"
      >
        Write
      </div>
    </b-modal>
    <div class="row">
      <div class="col-12">
        <div class="editor">
          <h3 class="text-center">
            You're publishing as <i style="font-size: 20px">{{ user }}</i>
          </h3>
          <hr />
          <h4>Your publications</h4>
          <div v-if="publications.length > 0">
            <div v-for="publication in publications" v-bind:key="publication.uuid">
              {{ publication.feed }}: <span v-if="publication.active === 'true' || publication.active === true" style="color:green">ACTIVE</span> <span v-if="publication.active === 'false' || publication.active === false" style="color:red">NOT ACTIVE</span>
            </div>
            <hr>
            Your master key is <b>{{ masterkey }}</b> with a balance of {{ balancemaster }} LYRA, useful to write about {{ Math.ceil(balancemaster / 0.0015) }} articles.
          </div>
          <div v-if="publications.length === 0">
            Nothing to show..
          </div>
          <hr />
          <h4>Add new publication</h4>
          <b-form-input
            v-model="rssURL"
            placeholder="Enter a valid RSS feed url"
          ></b-form-input>
          <br />
          <div class="text-center">
            <div v-if="isUploading">
              {{ workingmessage }}
            </div>
            <b-button pill v-if="!isUploading" v-on:click="openUnlock"
              >Write on the Blockchain</b-button
            >
          </div>
          <br /><br />
        </div>
      </div>
    </div>
    <div class="node-badge" v-if="connected">{{ connected }}</div>
  </div>
</template>

<style>
</style>

<script>
const ScryptaCore = require('@scrypta/core')
export default {
  name: "home",
  mounted: function () {
    this.checkIdaNodes();
  },
  methods: {
    showImagePrompt(command) {
      const src = prompt("Enter the url of your image here");
      if (src !== null) {
        command({ src });
      }
    },
    async checkUser() {
      const app = this;
      let user = await app.scrypta.keyExist();
      app.public_address = this.scrypta.PubAddress;
      app.encrypted_wallet = this.scrypta.RAWsAPIKey;
      if (user.length === 34) {
        app.user = user;
        app.axios
          .post(app.connected + "/contracts/run", {
            message:
              "7b22636f6e7472616374223a224c65394734415953476247716f6e483751456a4648446556414d5350784b394b5774222c2266756e6374696f6e223a22696e646578222c22706172616d73223a7b2274797065223a747275657d7d",
            hash:
              "0e2016ac7556e0e2b54da4874f2f835cdfcecf7497a1f09e7cfc634863a21775",
            signature:
              "32a064213e8dffc73ac84bdbfd6031bead1ab6a904626dbb546b01af004c65464dae34865a6e297938682768979d1827595524d5521037ea0dc3b75527311f34",
            pubkey:
              "020886603ce5f39660a50f0dd1d2cb48440f75a8eaa71a54828a39af29178e6a27",
            address: "LQhSfiCbuQW7d7GMeg462m8WaDohPY2LaH",
          })
          .then(async (response) => {
            let feeds = response.data
            for(let k in feeds){
              let feed = feeds[k]
              if(feed.manager === app.user){
                app.publications.push(feed)
                let hashmanager = await app.scryptacore.hash(app.user)
                let pathmanager = await app.scryptacore.hashtopath(hashmanager)
                let masterKey = await app.scryptacore.deriveKeyfromXPub(app.newsxpub, pathmanager)
                app.masterkey = masterKey.pub
                app.axios
                .get(app.connected + "/balance/" + app.masterkey, {
                }).then(balance => {
                  app.balancemaster = balance.data.balance
                })
              }
            }
          });
      } else {
        window.location = "/#/login";
      }
    },
    openUnlock() {
      const app = this;
      if (app.html !== "") {
        app.axios
          .get(app.connected + "/balance/" + app.user)
          .then((response) => {
            if (response.data.balance > app.fees) {
              app.passwordShow = true;
            } else {
              alert("Not enough balance!");
            }
          });
      } else {
        alert("Write something!");
      }
    },
    uploadData() {
      const app = this;
      if (app.html !== "") {
        app.isUploading = true;
        var errors = false;
        var protocol = "rsspin://";
        var dataToWrite = app.rssURL;

        if (errors === false && app.rssURL !== undefined) {
          app.workingmessage =
            "Uploading data to the blockchain, please wait and don't refresh the page...";
          app.scrypta
            .write(
              app.unlockPwd,
              dataToWrite,
              "",
              "",
              protocol,
              app.public_address + ":" + app.encrypted_wallet
            )
            .then((res) => {
              if (res.uuid !== undefined) {
                alert(
                  "Data written correctly into the blockchain, wait at least 2 minutes and refresh the page!"
                );
                this.isUploading = false;
                app.html = "";
                app.title = "";
                window.location = "/#/publish/";
              } else {
                alert("There's an error in the upload, please retry!");
                this.isUploading = false;
              }
            })
            .catch(() => {
              alert("There's an error in the upload, please retry!");
              this.isUploading = false;
            });
        } else {
          this.isUploading = false;
        }
      } else {
        alert("Write a text first!");
      }
    },
    unlockWallet() {
      if (this.unlockPwd !== "") {
        var app = this;
        app.decrypted_wallet = "WALLET LOCKED";
        app.scrypta.readKey(this.unlockPwd).then(function (response) {
          if (response !== false) {
            app.passwordShow = false;
            app.uploadData();
          } else {
            alert("Wrong password!");
          }
        });
      } else {
        alert("Write your password first");
      }
    },
    async checkIdaNodes() {
      var checknodes = this.scrypta.returnNodes();
      const app = this;
      for (var i = 0; i < checknodes.length; i++) {
        this.axios.get(checknodes[i] + "/wallet/getinfo").then((check) => {
          if (check.data.blocks !== undefined) {
            if (app.connected === "") {
              app.connected = check.config.url.replace("/wallet/getinfo", "");
              app.checkUser();
            }
          }
        });
      }
    },
  },
  data() {
    return {
      scrypta: window.ScryptaCore,
      scryptacore: new ScryptaCore(true),
      axios: window.axios,
      nodes: [],
      passwordShow: false,
      unlockPwd: "",
      newsxpub: "xpub661MyMwAqRbcGZEvgbbuvoiatRWCp9bV99JyPPcdotjHh4AzN2Q6HXJfgejzPT5HHwGnDngk3wFGQckTMvKrwDcT9eTw1946W52VJ6vM4rh",
      user: "",
      publications: [],
      connected: "",
      decrypted_wallet: "",
      public_address: "",
      encrypted_wallet: "",
      workingmessage: "",
      isUploading: false,
      rssURL: "",
      masterkey: "",
      subrssURL: "",
      balancemaster: 0,
      tagsToWrite: [],
      mainImageURL: "",
      fees: 0,
      chunks: 0,
    };
  }
};
</script>

<style>
.editor__content img {
  max-width: 100%;
}
.menubar__button {
  background: #fff;
  border: 0;
  font-weight: bold;
  margin: 5px;
  font-size: 30px;
  display: inline-block;
}
.node-badge {
  position: fixed;
  bottom: -3px;
  font-size: 10px;
  padding: 8px;
  right: 10px;
  z-index: 9999;
}
.editor__content {
  margin-top: 20px;
}
.editor__content * {
  outline: 0 !important;
}
</style>