import React from 'react';
import {Text,TouchableOpacity,View,StyleSheet,Image,TextInput,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../config';
import * as firebase from 'firebase';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookID:'',
            scannedStudentID:'',
            buttonState:'normal'
        }
    }

    getCameraPermissions=async(ID)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:ID,
            scanned:false
        })
    }

    checkBookEligibility=async()=>{
        const ref=await db.collection('books').where('bookID','==',this.state.scannedBookID).get()
        var transactionType='';
        if(ref.docs.length===0){
            transactionType=false;
        }
        else{
            ref.docs.map((doc)=>{
                var book= doc.data();
                if(book.bookAvailibility){
                    transactionType='Issue'
                }
                else{
                    transactionType='Return'
                }
            })
        }
        return transactionType;
    }

    checkStudentIssue=async()=>{
        const ref=await db.collection('students').where('studentID','==',this.state.scannedStudentID).get()
        var isIssue='';
        if(ref.docs.length===0){
            this.setState({
                scannedStudentID:'',
                scannedBookID:''
            })
            isIssue=false;
            alert('student does not exists');
        }
        else{
            ref.docs.map((doc)=>{
                var student= doc.data();
                if(student.noOfBooksIssued<2){
                    isIssue=true;
                }else{
                    isIssue=false;
                    alert('student already has issued 2 books')
                    this.setState({
                        scannedStudentID:'',
                        scannedBookID:''
                    })
                }
            })
        }
        return isIssue;
    }

    checkStudentReturn=async()=>{
        const ref=await db.collection('transactions').where('bookID','==',this.state.scannedBookID).limit(1).get()
        var isReturn='';
        ref.docs.map((doc)=>{
            var lastTransaction=doc.data();
            if(lastTransaction.studentID===this.state.scannedStudentID){
                isReturn=true;
            }
            else{
                isReturn=false;
                alert('this book was not issued by this student')
                    this.setState({
                        scannedStudentID:'',
                        scannedBookID:''
                    })
            }
        })
        return isReturn;
    }

    handleTransaction=async()=>{
    var transactionType=await this.checkBookEligibility();
    if(!transactionType){
        alert("the book doesn't exists!")
        this.setState({
        scannedStudentID:'',
        scannedBookID:''
        })
    }
    else if(transactionType==='Issue'){
        var isIssue=await this.checkStudentIssue();
        if(isIssue){
            this.initiateBookIssue();
            alert("book issued!")
        }
    }
    else{
        var isReturn=await this.checkStudentReturn();
        if(isReturn){
            this.initiateBookReturn();
            alert("book Returned!")
        }
    }
    /*var transactionMessage=null;
     db.collection('books').doc(this.state.scannedBookID).get()
     .then((doc)=>{
        var book=doc.data();
        if(book.bookAvailibility){
        this.initiateBookIssue();
        transactionMessage='bookIssued'
      //  ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
        else 
        {
            this.initiateReturn();
            transactionMessage='bookReturned'
    //        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
     })*/
    }

    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            studentID:this.state.scannedStudentID,
            bookID:this.state.scannedBookID,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'issue'
        });

        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvailibility:false
        })

        db.collection('students').doc(this.state.scannedStudentID).update({
            noOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        })

        this.setState({
            scannedBookID:'',
            scannedStudentID:''
        })
    }

    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            studentID:this.state.scannedStudentID,
            bookID:this.state.scannedBookID,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'return'
        });

        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvailibility:true
        })

        db.collection('students').doc(this.state.scannedStudentID).update({
            noOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        })

        this.setState({
            scannedBookID:'',
            scannedStudentID:''
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==='bookID'){
            this.setState({
                scanned:true,
                scannedBookID:data,
                buttonState:'normal'
                })
        }
        else if(buttonState==='studentID'){
            this.setState({
                scanned:true,
                scannedStudentID:data,
                buttonState:'normal'
                })
        }
    }
    
    render(){
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        const hasCameraPermissions=this.state.hasCameraPermissions;
        
            if(buttonState!=='normal' && hasCameraPermissions){
            return(
                <BarCodeScanner
                onBarCodeScanned={
                    scanned
                    ? undefined
                    : this.handleBarCodeScanned
                }

                style={StyleSheet.absoluteFillObject}
                />
            );
            }
            else if(buttonState==='normal'){
               
               return(<KeyboardAvoidingView behavior='padding' enabled  style={styles.container}>
               
                
                    <View>
                        <Image
                        source={require('../assets/booklogo.png')}
                        style={{width:100,height:100}}
                        />
                        <Text>
                        WirelessLibrary
                        </Text>
                    </View>

                    <View>
                        <TextInput
                        value={this.state.scannedBookID}
                        placeholder="book ID"
                        onChangeText={(text)=>{this.setState({scannedBookID:text})}}
                        />
                        <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermissions("bookID")
                        }}
                        >
                        <Text style={styles.text}> scan </Text>
                    </TouchableOpacity>
                    </View>
                    <View>
                        <TextInput
                         value={this.state.scannedStudentID}
                        placeholder="student ID"
                        onChangeText={(text)=>{this.setState({scannedStudentID:text})}}
                        />
                        <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermissions("studentID")
                        }}
                        >
                        <Text style={styles.text}> scan </Text>
                    </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submitButton}
                        onPress={()=>{
                            this.handleTransaction()
                            
                        }}
                        >
                        <Text style={styles.text}> scan </Text>
                    </TouchableOpacity>
                
                </KeyboardAvoidingView>
                );
            }
        
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:"center"
    },
    text:{
        fontSize:15
    },
    scanButton:{
        backgroundColor:'cyan',
        margin:10,
        padding:10
    },
    submitButton:{
        backgroundColor:'yellow',
        margin:10,
        padding:10
    }

})

