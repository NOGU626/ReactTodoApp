
import './App.css';
import styled from 'styled-components';
import React, { Component } from "react";
import TextField from '@material-ui/core/TextField';
// import firebase from 'firebase/app';
import * as firebase from 'firebase'
import firestore from 'firebase/firestore';
import config from './firebase-config.js';
import TodoList from "./todolist"
import Modal, {closeStyle} from 'simple-react-modal'

firebase.initializeApp(config);
const db = firebase.firestore();
const collection = db.collection('tweets');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            user: null,
            userUID:null,
            title:"",
            detail:"",
            modalcontent:{
                title:"",
                detail: "",
            },
            show: false,
        }
    }

    show = (i,item) =>{
        this.setState({
            show: true,
            modalcontent:{
                title:item.title,
                detail:item.detail,
                id:item.id
            },
        })
    }

    close = () =>{
        this.setState({
            show: false
        })
    }

    logout_google = () =>{
        firebase.auth().signOut();
        this.setState(
            {
                items: [],
                user: null,
                userUID:null,
                title:"",
                detail:"",
                modalcontent:{
                    title:"",
                    detail: "",
                },
                show: false,
            }
        )
    };

    // googleアカウントでログインした時の処理
    login_in_google = () =>{
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);

    };


    TextFieldTitle =(text)=>{
        console.log(text);
        this.setState(
            {
                title:text,
            }
        )
    }

    TextFieldDetail =(text)=>{
        this.setState(
            {
                detail:text,

            }
        )
    }

    handleSubmit = (event) => {
        console.log("クリック");
        if(this.state.title === "") {
            alert('タイトルを入力してください')
            return;
        } else if(this.state.detail === "") {
            alert('todoの詳細を入力してください')
            return;
        }

        const newItem = {
            user: this.state.user.uid,
            title: this.state.title,
            detail: this.state.detail,
        };

        this.setState(state => ({
            items: state.items.concat(newItem),
            title: '',
            detail: ''
        }));

        collection.add({
            user: this.state.user.uid,
            title: this.state.title,
            detail: this.state.detail,
            created: firebase.firestore.FieldValue.serverTimestamp()
        })
            .then(doc => {
                console.log(`${doc.id}をDBに追加したよ!`);
                window.location.reload();
            })
            .catch(error =>{
                console.log(error);
            });


    }

    async firebaseDeleat(documentPath){
        await collection.doc(documentPath).delete();
        window.location.reload();
    }


    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.setState({
                user:user ,
            })
            collection.where("user", "==", user.uid).orderBy('created').get()
                .then(snapshot =>{
                    snapshot.docs.map(doc => {
                        const allItems = {
                            user: doc.data().user,
                            title: doc.data().title,
                            detail: doc.data().detail,
                            created: doc.data().created,
                            id:doc.id,
                        }

                        this.setState(state => ({
                            items: state.items.concat(allItems),
                            title: '',
                            detail: ''
                        }));
                    });
                });
        })

    }

    render() {
        return (
           <div>
               <header>
                   <h1>ToDo Applicstion</h1>
               </header>
               {(() => {
                   if (this.state.user) {
                       return (
                           <ReactTodoAperation>
                               <p>ここではToDoを追加する操作を行います。</p>
                               <FormsLayout>
                                   <TextField id="standard-basic" label="追加するタイトル"
                                              value={this.state.title}
                                              onChange={e => this.TextFieldTitle(e.target.value)}
                                   />
                               </FormsLayout>
                               <FormsLayout>
                                   <TextField id="standard-basic" label="todoの詳細"
                                              value={this.state.detail}
                                              onChange={e => this.TextFieldDetail(e.target.value)}
                                   />
                               </FormsLayout>
                               <Button_denim_layout>
                                   <Button_denim onClick={()=>this.handleSubmit()}>登録を行う</Button_denim>
                                   <Button_denim onClick={()=>this.logout_google()}>ログアウト</Button_denim>
                               </Button_denim_layout>
                           </ReactTodoAperation>
                       )
                   } else {
                       return (
                           <ReactTodoAperation>
                               <Button_denim_layout>
                                   <Button_denim onClick={()=>this.login_in_google()}>Google Login</Button_denim>
                               </Button_denim_layout>
                           </ReactTodoAperation>
                       )
                   }
               })()}

               <ReactTodoAperation>
                   <ul>
                       {this.state.items.map((item, i) => {
                           if ( this.state.user  && item.user === this.state.user.uid) {
                               return(
                                   <li key={i}>
                                       <p onClick={()=>this.show(i,item)}>{item.title}</p>
                                   </li>
                               )
                           }else{
                               return(
                                   <div>
                                   </div>
                               )
                           }
                       })}
                   </ul>

                   <Modal show={this.state.show} closeOnOuterClick={true}  onClose={this.close.bind(this)}>
                       <Modal_title>{this.state.modalcontent.title}</Modal_title>
                       <p>{this.state.modalcontent.detail}</p>
                       <Button_denim onClick={()=>this.firebaseDeleat(this.state.modalcontent.id)}>このTodoを削除</Button_denim>
                   </Modal>


               </ReactTodoAperation>

               <footer>
                   <small>Copyright &copy; NOGU.D, all rights reserved.</small>
               </footer>
           </div>
        );
    }

}

const FormsLayout = styled.div`
  display: flex;
  flex-direction: column;
`

const ReactTodoAperation = styled.article`
    background-color: #ffffff;
    width: 450px;
    margin-left: auto;
    margin-right: auto;
    border: solid 1px #aaaaaa;
    padding: 30px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    margin-bottom: 15px;
    -webkit-box-shadow: 1px 1px 3px #aaaaaa;
    box-shadow: 1px 1px 3px #aaaaaa;
    border-radius: 20px
`;

const Button_denim = styled.a`
  display: inline-block;
  max-width: 180px;
  text-align: left;
  background-color: #293b6a;
  font-size: 16px;
  color: #FFF;
  text-decoration: none;
  font-weight: bold;
  padding: 8px 16px;
  margin-right: 30px;
  border: 1px dashed #FFF;
  box-shadow: 0px 0px 0px 5px #293b6a;
  &:hover {
     border-style: solid;
     transform: translateY(4px);
  }
`;

const Modal_title = styled.h2`
  color: #364e96;/*文字色*/
  padding: 0.5em 0;/*上下の余白*/
  border-top: solid 3px #364e96;/*上線*/
  border-bottom: solid 3px #364e96;/*下線*/

`;

const Button_denim_layout = styled.div`
  padding: 20px;
  text-align:center;
`;



export default App;
