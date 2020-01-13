<template>
  <div class="container" style="margin-top:40px">
    <div class="row">
      <div class="col-12">
        <h1>Scrypta News Feed</h1>
        <h3>is a minimal Proof of Concept of decentralized and verified content written by trustable addresses.</h3>
        <hr>
        <div v-if="isLoading">Loading news from the blockchain...</div>
        <div v-if="!isLoading">
          <br><br>
          <div v-for="news in feed" v-bind:key="news._id" class="feed" style="position:relative">
            <v-gravatar :email="news.address" height="50" class="gravatar-home" style="margin-right:20px; margin-top:-7px; float:left" />
            <h2 style="margin:0; padding:0; padding-right:40px">{{ news.refID }}</h2><br>
            <div style="font-size:15px; margin-top:-10px">
              <b><a :href="'/#/author/' + news.address">{{ news.address }}</a></b> at block <i>{{ news.block }}</i>
            </div>
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
  mounted : function(){
    this.checkIdaNodes()
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
                    protocol: 'news://'
                  }).then(response => {
                    app.feed = response.data.data
                    app.isLoading = false
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
      isLoading: true
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