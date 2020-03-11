<template>
  <div class="container" style="margin-top:40px">
    <div class="row">
      <div class="col-12">
        <h1>Login</h1>
        <h3>Please enter with your .sid file or use <i>ScryptaID Extension</i>.</h3>
        <hr>
        <b-form-file
          v-model="file"
          placeholder="Drag and drop a .sid file here o select it from computer"
          @change="loadWalletFromFile"
          class="text-left mb-3 mt-3"
        />
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
      async checkUser(){
        const app = this
        let user = await app.scrypta.keyExist()
        if(user.length === 34){
          window.location='/#/'
        }
      },
      async checkIdaNodes(){
        var checknodes = this.scrypta.returnNodes()
        const app = this
        for(var i = 0; i < checknodes.length; i++){
          this.axios.get(checknodes[i] + '/wallet/getinfo').then(
            check => {
              if(check.data.blocks !== undefined){
                if(app.connected === ''){
                  app.connected = check.config.url.replace('/wallet/getinfo','')
                  app.checkUser()
                }
              }
            }
          )
        }
      },
      loadWalletFromFile(ev) {
        const file = ev.target.files[0];
        const reader = new FileReader();
        var app = this;
        reader.onload = function() {
          var dataKey = reader.result;
          app.scrypta.saveKey(dataKey).then(function() {
            setTimeout(function() {
              location.reload()
            }, 1000);
          });
        };
        reader.readAsText(file);
      }
  },
  data () {
    return {
      scrypta: window.ScryptaCore,
      axios: window.axios,
      nodes: [],
      connected: '',
      isLoading: true,
      file: []
    }
  }
}
</script>

<style>
  .node-badge{
    position:fixed; bottom:-3px; font-size:10px; padding:8px; right:10px; z-index:9999;
  }
</style>