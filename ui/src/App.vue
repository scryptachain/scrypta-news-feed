<template>
  <div id="app">
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand href="/#/"><img height="30" style="float:left; margin-right:10px" src="./assets/logo.png"> Scrypta News</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <a href="/#/login" v-if="!user">
            <b-button size="sm" class="my-2 my-sm-0">Login</b-button>
          </a>
          <a style="color:#333; font-size:30px; margin-right:10px; margin-top:-7px" :href="'/#/author/' + user" v-if="user">
            <b-icon-document-text></b-icon-document-text>
          </a>
          <a href="#" v-if="user">
            <b-button size="sm" v-on:click="logout" class="my-2 my-sm-0">Logout</b-button>
          </a>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view/>
    <a href="/#/new" v-if="user">
      <b-button style="position:fixed; bottom:30px; font-weight:bold; font-size:30px; border-radius:200px; width:50px; padding:0; text-align:center; line-height:45px; height:50px; right:30px" pill variant="primary">+</b-button>
    </a>
  </div>
</template>

<script>

export default {
  mounted : function(){
    this.checkIdaNodes()
  },
  methods: {
      async logout(){
        const app = this
        await app.scrypta.forgetKey()
        location.reload()
      },
      async checkUser(){
        const app = this
        let user = await app.scrypta.keyExist()
        if(user.length === 34){
          app.user = user
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
      }
  },
  data () {
    return {
      scrypta: window.ScryptaCore,
      axios: window.axios,
      nodes: [],
      connected: '',
      isLoading: true,
      user: ''
    }
  }
}
</script>

<style>
  @import url('https://rsms.me/inter/inter.css');
  html, #app { font-family: 'Inter', sans-serif; }
  @media screen and (max-width: 767px){
    .sharing-buttons{text-align:center;}
    .sharing-buttons .btn{margin:10px!important;}
    h3{ font-size: 14px!important; }
    .gravatar-home{height:60px; margin-top: 3px!important; margin-right:10px!important; display:none}
    .news-head{text-align:center!important}
    .news-head img{float:none!important; display:inline-block; margin-right:0px!important; margin-bottom:5px; margin-top:15px!important;}
    .author{font-size:13px}
    .counters{font-size:13px}
    .feed{padding-right:15px;}
    h1{font-size:25px!important;}
    .container{margin-top:10px!important}
    .btn-sm{font-size:11px!important}
  }
  .news-text{text-align:justify; font-size: 18px; font-weight:300; padding-bottom:60px; line-height: 28px;}
  .news-text img {width:100%!important;}
  body, html {overflow-x:hidden}
</style>