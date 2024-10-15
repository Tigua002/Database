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
    const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
    console.log(userCred);
    console.log(userCred.user);
    console.log(userCred.user.email);
    console.log(userCred.user.uid);
    console.log(userCred.user.displayName);
    console.log(userCred.user.photoURL);
    console.log(userCred.user.phoneNumber);
    console.log(userCred.user.providerData);

    /*             const data = {
                    username: result.user.email,
                    password: result.user.uid,
                    isNewUser: result.additionalUserInfo.isNewUser
                }
                const response = await fetch('/login/google', {
                    method: 'POST',
                    body: JSON.stringify(data)
                })
                .then(response => response.text())
                .then(data => console.log(data)); */
})
