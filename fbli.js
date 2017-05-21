// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: '',
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: ''
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

initUser = function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            currentUser.signInStatus = true;
            currentUser.displayName = user.displayName;
            currentUser.email = user.email;
            currentUser.emailVerified = user.emailVerified;
            currentUser.photoURL = user.photoURL;
            if (currentUser.photoURL == null)
            {
                currentUser.photoURL = 'https://openclipart.org/download/237991/users81.svg';
            }
            currentUser.uid = user.uid;
            currentUser.providerData = user.providerData;
            signedInHandler();
        } else {
            // User is signed out.
            currentUser.signInStatus = false;
            currentUser.displayName = "";
            currentUser.email = "";
            currentUser.emailVerified = "";
            currentUser.photoURL = "";
            currentUser.uid = "";
            currentUser.providerData = "";
            signedOutHandler();
        }
    }, function(error) {
        console.log(error);
    });
};

window.addEventListener('load', function() {
    initUser();
});

var currentUser = {
    signInStatus:"",
    displayName:"",
    email:"",
    emailVerified:"",
    photoURL:"",
    uid:"",
    providerData:"",
}
