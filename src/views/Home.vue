<template>
  <div class="container" style="margin-top:40px">
    <div class="row">
      <div class="col-12">
        <h1>Scrypta News Feed</h1>
        <h3>is a minimal Proof of Concept of decentralized and verified content written by trustable addresses.</h3>
        <hr>
        <div v-if="isLoading">Loading news from the blockchain...</div>
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
      isLoading: true
    }
  }
}
</script>

<style>
  .node-badge{
    position:fixed; bottom:-3px; font-size:10px; padding:8px; right:10px; z-index:9999;
  }
</style>