// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDc3t2xnsWZxT9GuHNGQzEnW0uw3jpdag",
    authDomain: "dataspot-66ab9.firebaseapp.com",
    projectId: "dataspot-66ab9",
    storageBucket: "dataspot-66ab9.appspot.com",
    messagingSenderId: "465932511935",
    appId: "1:465932511935:web:1440078f3dbd2facf1b40a",
    measurementId: "G-92NSBQ7NTP"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

document.getElementById('google-button').addEventListener('click', async () => {
    var userCred = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    console.log(userCred);

    const data = {
        username: userCred.user.email,
        password: userCred.user.uid,
        isNewUser: userCred.additionalUserInfo.isNewUser
    }
    const response = await fetch('/login/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const token = await response.text();
    console.log(token);
})
