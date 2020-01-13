<template>
  <div class="container" style="margin-top:40px">
    <div class="row">
      <div class="col-12">
        <div v-if="isLoading">Loading news from the blockchain...</div>
        <div v-if="!isLoading">
            <h1 style="margin:0; padding:0; line-height:9px">{{ news.refID }}</h1><br>
            <div style="font-size:15px; margin-top:0px">
            <v-gravatar :email="news.address" height="80" style="margin-right:20px; margin-top:6px; float:left" />
            Written by <b><a :href="'/#/author/' + news.address">{{ news.address }}</a></b></div>
            at block <i>{{ news.block }}</i><br>
            Timestamped at {{ time }}<br>
            <a :href="'https:/proof.scryptachain.org/#/uuid/' + news.uuid" target="_blank">
              Show Proof of Existence <b-icon-arrow-right></b-icon-arrow-right>
            </a>
            <hr>
            <div class="news" v-html="news.data"></div>
          </div>
        </div>
      </div>
      <div class="node-badge" v-if="connected">{{ connected }}</div>
  </div>
</template>


<script>
var LZUTF8 = require('lzutf8');

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
                    uuid: app.$route.params.uuid
                  }).then(response => {
                    app.news = response.data.data[0]
                    app.news.data = LZUTF8.decompress(app.news.data, { inputEncoding: 'Base64' });
                    app.time = new Date(app.news.time * 1000).toUTCString()
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
      time: '',
      news: [],
      isLoading: true
    }
  }
}
</script>

<style>
  .node-badge{
    position:fixed; bottom:-3px; font-size:10px; padding:8px; right:10px; z-index:9999;
  }
  .news img{
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