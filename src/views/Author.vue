<template>
  <div class="container" style="margin-top: 40px">
    <vue-headful
      title="Scrypta Decentralized News Feed"
      description="Read articles from trusted sources."
    />
    <div class="row">
      <div class="col-12">
        <v-gravatar
          :email="author"
          height="70"
          style="margin-right: 20px; margin-top: 0px; float: left"
        />
        <div v-if="feed[0] && feed[0].data.creator">
          <h4 class="author">{{ feed[0].data.creator }}</h4>
          Identified as
          <b
            >{{
             author
            }}</b
          >
        </div>
        <div v-if="feed[0] && !feed[0].data.creator">
          <h4 class="author">{{ author }}</h4>
        </div>
        <h5>
          {{ identities.length }} verified
          <span v-if="identities.length === 1">identity</span
          ><span v-if="identities.length !== 1">identities</span>
          <div
            style="
              float: right;
              text-align: right;
              width: 30%;
              display: inline-block;
            "
          >
            <span v-for="identity in identities" v-bind:key="identity._id">
              <a
                :href="'https://proof.scryptachain.org/#/uuid/' + identity.uuid"
                target="_blank"
              >
                <img
                  src="../assets/twitter.svg"
                  style="margin-left: 10px"
                  height="25"
                  v-if="identity.refID === 'TWITTER'"
                />
                <img
                  src="../assets/linkedin.svg"
                  style="margin-left: 10px"
                  height="25"
                  v-if="identity.refID === 'LINKEDIN'"
                />
                <img
                  src="../assets/github.svg"
                  style="margin-left: 10px"
                  height="25"
                  v-if="identity.refID === 'GITHUB'"
                />
                <img
                  src="../assets/google-plus.svg"
                  style="margin-left: 10px"
                  height="25"
                  v-if="identity.refID === 'GOOGLE'"
                />
                <img
                  src="../assets/mail.svg"
                  height="25"
                  style="margin-left: 10px"
                  v-if="identity.refID === 'EMAIL'"
                />
                <img
                  src="../assets/iphone.svg"
                  height="25"
                  style="margin-left: 10px"
                  v-if="identity.refID === 'PHONE'"
                />
              </a>
            </span>
          </div>
        </h5>
        <hr />
        <div v-if="isLoading">Loading author's news from the blockchain...</div>
        <div v-if="!isLoading && feed.length === 0">
          Nothing to show here...
        </div>
        <div v-if="!isLoading">
          <div
            v-for="news in feed"
            v-bind:key="news._id"
            class="feed"
            style="position: relative"
          >
            <div v-if="news.data !== 'upvote' && news.data !== 'downvote'">
              <div v-if="!news.data.title">
                <h2 style="font-size: 15px; font-weight: bold">
                  {{ news.refID }}
                </h2>
              </div>
              <div v-if="news.data.title">
                <h2 style="font-size: 15px; font-weight: bold">
                  {{ news.data.title }}
                </h2>
              </div>
              <div style="font-size: 12px">
                Written at block <i>{{ news.block }}</i>
              </div>
              <div v-if="counters" class="counters">
                <div v-for="counter in counters" v-bind:key="counter.uuid">
                  <div v-if="counter.uuid === news.uuid">
                    <b
                      ><b-icon-arrow-up></b-icon-arrow-up>
                      {{ counter.upvotes }}</b
                    >
                    UPVOTES
                    <b
                      ><b-icon-arrow-down></b-icon-arrow-down>
                      {{ counter.downvotes }}</b
                    >
                    DOWNVOTES
                  </div>
                </div>
              </div>
              <a :href="'/#/news/' + news.uuid">
                <b-icon-arrow-right
                  style="font-size: 30px !important"
                  class="arrow-dx"
                ></b-icon-arrow-right>
              </a>
              <a v-if="author === user" :href="'/#/edit/' + news.uuid">
                <b-icon-pencil
                  style="font-size: 28px !important"
                  class="pencil-dx"
                ></b-icon-pencil>
              </a>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="node-badge" v-if="connected">{{ connected }}</div>
  </div>
</template>

<script>
var LZUTF8 = require("lzutf8");
export default {
  name: "home",
  mounted: async function () {
    const app = this;
    app.checkIdaNodes();
    app.checkUser();
    app.author = app.$route.params.address;
  },
  methods: {
    async checkUser() {
      const app = this;
      let user = await app.scrypta.keyExist();
      if (user.length === 34) {
        app.user = user;
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
              app.axios
                .post(app.connected + "/read", {
                  protocol: "news://",
                  address: app.author,
                })
                .then(async (response) => {
                  if (response.data.data.length > 0) {
                    for (let x in response.data.data) {
                      if (
                        response.data.data[x].data !== "upvote" &&
                        response.data.data[x].data !== "downvote"
                      ) {
                        let nws = response.data.data[x].data;
                        if (nws.signature !== undefined) {
                          let verify = await app.scrypta.verifyMessage(
                            nws.pubkey,
                            nws.signature,
                            nws.message
                          );
                          if (verify !== false) {
                            response.data.data[x].data = JSON.parse(
                              response.data.data[x].data.message
                            );
                            response.data.data[
                              x
                            ].data.title = LZUTF8.decompress(
                              response.data.data[x].data.title,
                              { inputEncoding: "Base64" }
                            );
                            response.data.data[
                              x
                            ].data.text = LZUTF8.decompress(
                              response.data.data[x].data.compressed,
                              { inputEncoding: "Base64" }
                            );
                            response.data.data[
                              x
                            ].data.tags = LZUTF8.decompress(
                              response.data.data[x].data.tags,
                              { inputEncoding: "Base64" }
                            );
                            response.data.data[x].data.tags = JSON.parse(
                              response.data.data[x].data.tags
                            );
                            response.data.data[
                              x
                            ].data.guid = LZUTF8.decompress(
                              response.data.data[x].data.guid,
                              { inputEncoding: "Base64" }
                            );
                            response.data.data[
                              x
                            ].data.creator = LZUTF8.decompress(
                              response.data.data[x].data.creator,
                              { inputEncoding: "Base64" }
                            );
                            response.data.data[
                              x
                            ].data.link = LZUTF8.decompress(
                              response.data.data[x].data.link,
                              { inputEncoding: "Base64" }
                            );
                            app.feed.push(response.data.data[x]);
                          }
                        } else {
                          if (nws.title !== undefined) {
                            response.data.data[
                              x
                            ].data.title = LZUTF8.decompress(nws.title, {
                              inputEncoding: "Base64",
                            });
                            response.data.data[
                              x
                            ].data.subtitle = LZUTF8.decompress(nws.subtitle, {
                              inputEncoding: "Base64",
                            });
                            response.data.data[
                              x
                            ].data.image = LZUTF8.decompress(nws.image, {
                              inputEncoding: "Base64",
                            });
                            response.data.data[
                              x
                            ].data.text = LZUTF8.decompress(nws.text, {
                              inputEncoding: "Base64",
                            });
                          }
                          app.feed.push(response.data.data[x]);
                        }
                      }
                    }
                  }
                  app.readCounters();
                  app.isLoading = false;
                });
              app.axios
                .post(app.connected + "/read", {
                  protocol: "I://",
                  address: app.author,
                })
                .then(async (result) => {
                  app.identities = [];
                  for (let k in result.data.data) {
                    let id = result.data.data[k];
                    if (app.check.indexOf(id.refID) === -1) {
                      app.check.push(id.refID);
                      app.identities.push(id);
                    }
                  }
                });
            }
          }
        });
      }
    },
    async readCounters() {
      const app = this;
      for (let y in app.feed) {
        let votes = await app.axios.post(app.connected + "/read", {
          protocol: "news://",
          refID: app.feed[y].uuid,
        });
        let upvotes = 0;
        let downvotes = 0;
        for (let x in votes.data.data) {
          if (app.voters[app.feed[y].uuid] === undefined) {
            app.voters[app.feed[y].uuid] = {};
          }
          if (
            app.voters[app.feed[y].uuid][votes.data.data[x].address] ===
            undefined
          ) {
            if (votes.data.data[x].data === "upvote") {
              upvotes++;
              app.voters[app.feed[y].uuid][votes.data.data[x].address] =
                "upvote";
            } else if (votes.data.data[x].data === "downvote") {
              downvotes++;
              app.voters[app.feed[y].uuid][votes.data.data[x].address] =
                "downvote";
            }
          }
        }
        app.counters.push({
          uuid: app.feed[y].uuid,
          upvotes: upvotes,
          downvotes: downvotes,
        });
      }
    },
  },
  data() {
    return {
      scrypta: window.ScryptaCore,
      axios: window.axios,
      nodes: [],
      connected: "",
      feed: [],
      author: "",
      isLoading: true,
      identities: [],
      check: [],
      counters: [],
      user: "",
      voters: {},
    };
  },
};
</script>

<style>
.node-badge {
  position: fixed;
  bottom: -3px;
  font-size: 10px;
  padding: 8px;
  right: 10px;
  z-index: 9999;
}
.feed img {
  max-width: 100%;
}
.arrow-dx {
  color: #000;
  font-size: 40px !important;
  position: absolute;
  top: -10px;
  right: 0;
}
.pencil-dx {
  color: #000;
  font-size: 40px !important;
  position: absolute;
  top: 40px;
  right: 0;
}
</style>