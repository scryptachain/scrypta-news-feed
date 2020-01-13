<template>
  <div class="container" style="margin-top:40px">
    <div class="row">
      <div class="col-12">
        <v-gravatar :email="author" height="70" style="margin-right:20px; margin-top:0px; float:left" />
        <h4>{{ author }}</h4>
        <h5>
          {{ identities.length }} verified identities
          <div style="float:right; text-align:right; width:30%; display:inline-block">
            <span v-for="identity in identities" v-bind:key="identity._id">
              <a :href="'https://proof.scryptachain.org/#/uuid/' + identity.uuid" target="_blank">
                <img src="../assets/twitter.svg" height="25" v-if="identity.refID === 'TWITTER'">
                <img src="../assets/linkedin.svg" style="margin-left:10px" height="25" v-if="identity.refID === 'LINKEDIN'">
                <img src="../assets/github.svg" style="margin-left:10px" height="25" v-if="identity.refID === 'GITHUB'">
                <img src="../assets/google-plus.svg" style="margin-left:10px" height="25" v-if="identity.refID === 'GOOGLE'">
                <img src="../assets/mail.svg" height="25" style="margin-left:10px" v-if="identity.refID === 'EMAIL'">
                <img src="../assets/iphone.svg" height="25" style="margin-left:10px" v-if="identity.refID === 'PHONE'">
              </a>
            </span>
          </div>
        </h5>
        <hr>
        <div v-if="isLoading">Loading author's news from the blockchain...</div>
        <div v-if="!isLoading">
          <br><br>
          <div v-for="news in feed" v-bind:key="news._id" class="feed" style="position:relative">
            <h2 style="margin:0; padding:0; line-height:9px">{{ news.refID }}</h2><br>
            <div style="font-size:15px; margin-top:-10px">Written at block <i>{{ news.block }}</i></div>
            <br>
            <a :href="'/#/news/' + news.uuid">
              <b-icon-arrow-right class="arrow-dx"></b-icon-arrow-right>
            </a>
            <hr>
          </div>
        </div>
      </div>
    </div>
    <div class="node-badge" v-if="connected">{{ connected }}</div>
  </div>
</template>

<script>

export default {
  name: 'home',
  mounted : async function(){
    const app = this
    app.checkIdaNodes()
    app.author = app.$route.params.address
  },
  methods: {
      async checkIdaNodes(){
        var checknodes = this.scrypta.returnNodes()
        const app = this
        for(var i = 0; i < checknodes.length; i++){
          this.axios.get(checknodes[i] + '/wallet/getinfo').then(
            check => {
              if(check.data.blocks !== undefined){
                if(app.connected === ''){
                  app.connected = check.config.url.replace('/wallet/getinfo','')
                  app.axios.post(app.connected + '/read', {
                    protocol: 'news://',
                    address: app.author
                  }).then(response => {
                    app.feed = response.data.data
                    app.isLoading = false
                  })
                  app.axios.post(app.connected + '/read', {
                    protocol: 'I://',
                    address: app.author
                  }).then(async result => {
                    app.identities = result.data.data
                  })
                }
              }
            }
          )
        }
      }
  },
  data () {
    return {
      scrypta: window.ScryptaCore,
      axios: window.axios,
      nodes: [],
      connected: '',
      feed: [],
      author: '',
      isLoading: true,
      identities: []
    }
  }
}
</script>

<style>
  .node-badge{
    position:fixed; bottom:-3px; font-size:10px; padding:8px; right:10px; z-index:9999;
  }
  .feed img{
    max-width:100%
  }
  .arrow-dx{
    color:#000;
    font-size:60px!important;
    position:absolute;
    top:-10px;
    right:0;
  }
</style>