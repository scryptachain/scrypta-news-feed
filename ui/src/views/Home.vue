<template>
  <div class="container" style="margin-top:40px">
    <vue-headful
      title="Scrypta Decentralized News Feed"
      description="Read articles from trusted sources."
    />
    <div class="row">
      <div class="col-12">
        <h1>Scrypta News</h1>
        <h3>read articles from trusted sources.</h3>
        <hr>
        <div v-if="isLoading">Loading news from the blockchain...</div>
        <div v-if="!isLoading">
          <div v-for="news in feed" v-bind:key="news._id" class="feed" style="position:relative">
            <div v-if="news.data !== 'upvote' && news.data !== 'downvote'">
              <v-gravatar v-if="!news.data.image" :email="news.address" height="85" class="gravatar-home" style="margin-right:20px; margin-top:0px; float:left" />
              <div v-if="news.data.image" :style="'margin-right:20px; width:85px; height:85px; background-position:center; background-repeat:no-repeat; background-size:cover; margin-top:0px; float:left; background-image:url(\''+news.data.image+'\')'"></div>
              <div v-if="!news.data.title">
               <h3 style="margin:0; padding:0; padding-right:40px">{{ news.refID }}</h3>
              </div>
              <div v-if="news.data.title">
               <h3 style="margin:0; padding:0; padding-right:40px">{{ news.data.title }}</h3>
              </div>
              <div v-if="news.data.tags">
               <span v-for="tag in news.data.tags" v-bind:key="tag" style="margin:0; padding:0; padding-right:10px">#{{ tag }}</span>
              </div>
              <div style="font-size:15px;">
                Written by <b><a :href="'/#/author/' + news.address">{{ news.address.substr(0,3) }}...{{ news.address.substr(-3) }}</a></b> at block <i>{{ news.block }}</i>
              </div>
              <div v-if="counters" class="counters">
                <div v-for="counter in counters" v-bind:key="counter.uuid">
                  <div v-if="counter.uuid === news.uuid">
                    <b><b-icon-arrow-up></b-icon-arrow-up> {{ counter.upvotes }}</b> UPVOTES
                    <b><b-icon-arrow-down></b-icon-arrow-down> {{ counter.downvotes }}</b> DOWNVOTES
                  </div>
                </div>
              </div>
              <a :href="'/#/news/' + news.uuid">
                <b-icon-arrow-right class="arrow-dx"></b-icon-arrow-right>
              </a>
              <hr>
            </div>
          </div>
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
                    protocol: 'news://'
                  }).then(response => {
                    for(let x in response.data.data){
                      let nws = response.data.data[x].data
                      if(nws.title !== undefined){
                        response.data.data[x].data.title = LZUTF8.decompress(nws.title, { inputEncoding: 'Base64' });
                        response.data.data[x].data.subtitle = LZUTF8.decompress(nws.subtitle, { inputEncoding: 'Base64' });
                        response.data.data[x].data.image = LZUTF8.decompress(nws.image, { inputEncoding: 'Base64' });
                        response.data.data[x].data.text = LZUTF8.decompress(nws.text, { inputEncoding: 'Base64' });
                        if(nws.tags !== undefined){
                          response.data.data[x].data.tags = LZUTF8.decompress(nws.tags, { inputEncoding: 'Base64' });
                          response.data.data[x].data.tags = response.data.data[x].data.tags.split(',')
                        }else{
                          response.data.data[x].data.tags = []
                        }
                      }
                      app.feed.push(response.data.data[x])
                    }
                    app.isLoading = false
                    app.readCounters()
                  })
                }
              }
            }
          )
        }
      },
      async readCounters(){
        const app = this
        for(let y in app.feed){
          let votes = await app.axios.post(app.connected + '/read',{ protocol: 'news://', refID: app.feed[y].uuid })
          let upvotes = 0
          let downvotes = 0
          for(let x in votes.data.data){
            if(app.voters[app.feed[y].uuid] === undefined){
              app.voters[app.feed[y].uuid] = {}
            }
            if(app.voters[app.feed[y].uuid][votes.data.data[x].address] === undefined){
              if(votes.data.data[x].data === 'upvote'){
                upvotes++
                app.voters[app.feed[y].uuid][votes.data.data[x].address] = 'upvote'
              }else if(votes.data.data[x].data === 'downvote'){
                downvotes++
                app.voters[app.feed[y].uuid][votes.data.data[x].address] = 'downvote'
              }
            }
          }
          app.counters.push({
            'uuid': app.feed[y].uuid,
            'upvotes': upvotes,
            'downvotes': downvotes
          })
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
      isLoading: true,
      counters: [],
      voters: {}
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