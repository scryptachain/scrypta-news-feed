<template>
  <div class="container" style="margin-top: 40px">
    <b-modal v-model="passwordShow" hide-footer title="Write news on the blockchain">
      <b-form-input v-if="!isUploading" v-model="unlockPwd" type="password" placeholder="Enter wallet password"></b-form-input><br>
      <div v-if="!isUploading" @click.prevent="unlockWallet" class="btn btn-primary">Write</div>
    </b-modal>
    <div class="row">
      <div class="col-12">
        <div class="editor">
          <h3 class="text-center">You're writing as <i style="font-size:20px">{{ user }}</i></h3>
          <hr>
          <b-form-input v-model="titleToWrite" placeholder="Enter a title"></b-form-input>
          <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
            <div class="menubar" style="text-align:center; width:100%">
                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.bold() }"
                  @click="commands.bold"
                >
                  <b-icon-type-bold></b-icon-type-bold>
                </button>
                <button
                  class="menubar__button"
                  @click="showImagePrompt(commands.image)"
                >
                  <b-icon-image></b-icon-image>
                </button>
                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.italic() }"
                  @click="commands.italic"
                >
                  <b-icon-type-italic></b-icon-type-italic>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.strike() }"
                  @click="commands.strike"
                >
                  <b-icon-type-strikethrough></b-icon-type-strikethrough>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.underline() }"
                  @click="commands.underline"
                >
                  <b-icon-type-underline></b-icon-type-underline>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.paragraph() }"
                  @click="commands.paragraph"
                >
                  p
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                  @click="commands.heading({ level: 1 })"
                >
                  <b-icon-type-h1></b-icon-type-h1>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                  @click="commands.heading({ level: 2 })"
                >
                  <b-icon-type-h2></b-icon-type-h2>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                  @click="commands.heading({ level: 3 })"
                >
                  <b-icon-type-h3></b-icon-type-h3>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.bullet_list() }"
                  @click="commands.bullet_list"
                >
                  <b-icon-list-ul></b-icon-list-ul>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.ordered_list() }"
                  @click="commands.ordered_list"
                >
                  <b-icon-list-ol></b-icon-list-ol>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.blockquote() }"
                  @click="commands.blockquote"
                >
                  <b-icon-blockquote-left></b-icon-blockquote-left>
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.code_block() }"
                  @click="commands.code_block"
                >
                  <b-icon-code></b-icon-code>
                </button>

                <button
                  class="menubar__button"
                  @click="commands.undo"
                >
                  <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
                </button>

                <button
                  class="menubar__button"
                  @click="commands.redo"
                >
                  <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                </button>

              </div>
            </editor-menu-bar>
            <hr>
            <editor-content style="padding:0" class="editor__content" :editor="editor" />
            <hr>
            <div class="text-center">
              This news will write {{ chunks }} transaction<span v-if="chunks > 1">s</span> and it will cost {{ fees }} LYRA
            </div>
            <br>
            <div class="text-center">
            <div v-if="isUploading">
              {{ workingmessage }}
            </div>
              <b-button pill v-if="!isUploading" v-on:click="openUnlock">Write on the Blockchain</b-button>
            </div>
            <br><br>
          </div>
      </div>
    </div>
    <div class="node-badge" v-if="connected">{{ connected }}</div>
  </div>
</template>

<style>
</style>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
var LZUTF8 = require('lzutf8');
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Image,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'

export default {
  name: 'home',
  components: {
    EditorContent,
    EditorMenuBar,
  },
  mounted : function(){
    this.checkIdaNodes()
  },
  methods: {
      showImagePrompt(command) {
        const src = prompt('Enter the url of your image here')
        if (src !== null) {
          command({ src })
        }
      },
      async checkUser(){
        const app = this
        let user = await app.scrypta.keyExist()
        app.public_address = this.scrypta.PubAddress;
        app.encrypted_wallet = this.scrypta.RAWsAPIKey;
        if(user.length === 34){
          app.user = user
        }else{
          window.location='/#/login'
        }
      },
      openUnlock(){
        const app = this
        if(app.html !== ''){
          app.axios.get(app.connected + '/balance/' + app.user).then(response => {
            if(response.data.balance > app.fees){
              app.passwordShow = true
            }else{
              alert('Not enough balance!')
            }
          })
        }else{
          alert('Write something!')
        }
      },
      uploadData(){
        const app = this
        if (app.html !== '') {
          app.isUploading = true
          var errors = false
          var protocol = 'news://'
          var refID = ''
          
          if(app.titleToWrite !== ''){
            refID = app.titleToWrite
          }
          var uncompressed = app.html
          var compressed = LZUTF8.compress(uncompressed,{outputEncoding: 'Base64'})
          
          if(errors === false){
            app.workingmessage = 'Uploading data to the blockchain, please wait and don\'t refresh the page...'
            app.scrypta.write(app.unlockPwd, compressed, '', refID , protocol, app.public_address + ':' + app.encrypted_wallet).then(res => {
              if(res.uuid !== undefined){
                alert('Data written correctly into the blockchain, wait at least 2 minutes and refresh the page!')
                this.isUploading = false
                app.html = ''
                app.title = ''
                window.location = '/#/author/' + app.user
              }else{
                alert('There\'s an error in the upload, please retry!')
                this.isUploading = false
              }
            }).catch(() => {
              alert('There\'s an error in the upload, please retry!')
              this.isUploading = false
            })
          }else{
            this.isUploading = false
          }
        } else {
          alert('Write a text first!')
        }
      },
      unlockWallet(){
        if(this.unlockPwd !== ''){
          var app = this
          app.decrypted_wallet = 'WALLET LOCKED'
          app.scrypta.readKey(this.unlockPwd).then(function (response) {
            if(response !== false){
              app.passwordShow = false
              app.uploadData()
            }else{
              alert('Wrong password!')
            }
          })
        }else{
          alert('Write your password first')
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
      passwordShow: false,
      unlockPwd: '',
      user: '',
      connected: '',
      decrypted_wallet: '',
      public_address: '',
      encrypted_wallet: '',
      workingmessage: '',
      isUploading: false,
      titleToWrite: '',
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new Image(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
        ],
        content: ` `,
        onUpdate: ({ getHTML }) => {
          this.html = getHTML()
          var uncompressed = this.html
          var compressed = LZUTF8.compress(uncompressed,{outputEncoding: 'Base64'})
          let chunks = Math.ceil(compressed.length / 7500)
          this.chunks = chunks
          this.fees = chunks * 0.001
        },
      }),
      html: '',
      fees: 0,
      chunks: 0
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>

<style>
  .editor__content img {max-width: 100%}
  .menubar__button{
    background:#fff;
    border:0; 
    font-weight:bold;
    margin:5px;
    font-size:30px;
    display:inline-block;
  }
  .node-badge{
    position:fixed; bottom:-3px; font-size:10px; padding:8px; right:10px; z-index:9999;
  }
  .editor__content{
    margin-top:20px;
  }
  .editor__content *{
    outline: 0!important;
  }
</style>