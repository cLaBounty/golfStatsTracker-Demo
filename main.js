// checking if on mobile
function checkMobile() {
    const screenWidth = $('html').width();
    if (screenWidth <= 850) {
        document.getElementById('hide-toolbar-message').style.display = 'flex';
    }
}

function hideToolbarContinue() {
    document.getElementById('hide-toolbar-message').style.display = 'none';
}

function switchToSignup() {
    // clear error
    document.getElementById('login-error-message').style.visibility = "hidden";

    // switch forms
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function switchToLogin() {
    // clear error and input
    document.getElementById('signup-error-message').style.visibility = "hidden";
    document.getElementById('signup-email-input').value = "";
    document.getElementById('signup-password-input').value = "";
    document.getElementById('signup-displayName-input').value = "";

    // switch forms
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function login() {
    const email = document.getElementById('login-email-input').value;
    const password = document.getElementById('login-password-input').value;

    // check if user exists
    auth.signInWithEmailAndPassword(email, password).then(() => {
        toHomePage();
    }).catch(err => {
        document.getElementById('login-error-message').innerHTML = err.message;
        document.getElementById('login-error-message').style.visibility = 'visible';
    });
}

function signup() {
    document.getElementById('signup-error-message').innerHTML =
        "This site is for demostration purposes only. Please click <a id='live-link' href='https://clabounty.github.io/golfStatsTracker/' target='_blank'>here</a> to visit the live version and to create a new account.";
    document.getElementById('signup-error-message').style.visibility = 'visible';
}

function logout() {
    auth.signOut().then(() => {
        location.reload();
    });
}

// sleep for given amount of seconds
const sleep = (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

// remove all pages
function hidePages() {
    document.getElementById('nav-check').checked = false;

    document.getElementById('home-page').style.display = 'none';
    document.getElementById('friends-page').style.display = 'none';
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('newRound-page').style.display = 'none';
    document.getElementById('stats-page').style.display = 'none';
}

function toHomePage() {
    hidePages();

    // hide login page - (only appears when first loaded)
    document.getElementById('login-page').style.display = 'none';

    // display new content
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('home-page').style.display = 'flex';
    document.getElementById('page-label').innerHTML = "Home";

    // reset new round page
    document.getElementById("hole-number-text").style.display = 'flex';
    document.getElementById("newRound-error-full").style.display = 'none';
    document.getElementById("nine-hole-message").style.display = 'none';
    document.getElementById("round-end-message").style.display = 'none';
    document.getElementById('hole-number').innerHTML = 1;
}

/* FRIENDS page Functions */
function toFriendsPage() {
    hidePages();

    // only setup once
    friendPageSetUp();

    // reseting search input
    document.getElementById('displayName-input').value = "";
    $("#displayName-input").keyup();

    // display new content
    document.getElementById('friends-page').style.display = 'flex';
    document.getElementById('page-label').innerHTML = "Friends";
}

// live friend search
$(document).ready(function () {
    $("#displayName-input").keyup(function () {
        const input = String($(this).val());
        var count = 0;

        if (input != "") {
            // looping through the list
            $(".userlist-div").each(function () {
                // if they don't math
                if ($(this).text().search(new RegExp(input, "i")) < 0) {
                    $(this).fadeOut(500);
                }
                else { // if they do match
                    $(this).css('display', 'grid')
                    $(this).fadeIn(500);
                    count++;
                }
            });

            // if 0 results, then display message
            if (count == 0) {
                $("#no-results-message-value").text("\"" + input + "\"");
                document.getElementById('no-results-message').style.display = 'block';
            }
            else {
                document.getElementById('no-results-message').style.display = 'none';
            }
        }
        else { // if empty
            document.getElementById('no-results-message').style.display = 'none';
            $(".userlist-div").each(function () {
                $(this).fadeOut(500);
            });
        }
    });
});

var friendPageSetUp = (function () {
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;

            // getting all users displayName and uid and creating a new div
            database.collection('users').get().then(snapshot => {
                snapshot.docs.forEach(doc => {
                    // don't add the current user
                    if (auth.currentUser.uid != doc.data().uid) {
                        addUser(doc.data().uid, doc.data().displayName);
                    }
                });
            });

            // getting current users info
            const currentUserId = auth.currentUser.uid;
            database.collection('users').doc(currentUserId).get().then(snapshot => {
                const currentUser = snapshot.data();

                // copying friends array
                const myArray = currentUser.friends;

                // check for friends and setting the + to a -
                for (let i in myArray) {
                    database.collection('users').doc(myArray[i]).get().then(snapshot => {
                        const friend = snapshot.data();
                        const target = friend.displayName;
                        const targetID = myArray[i];

                        $(".userlist-div").each(function () {
                            if ($(this).text() == target) {
                                document.getElementById(targetID + '-add').style.display = 'none';
                                document.getElementById(targetID + '-remove').style.display = 'block';
                            }
                        });
                    });
                }
            });
        }
    }
})();

function addUser(uid, displayName) {
    const ul = document.getElementById("user-list");

    var div = document.createElement("div");
    var userIcon = document.createElement("i");
    var li = document.createElement("li");
    var plusIconDiv = document.createElement("div");
    var plusIcon = document.createElement("i");
    var minusIconDiv = document.createElement("div");
    var minusIcon = document.createElement("i");

    div.setAttribute('class', 'userlist-div');
    li.setAttribute('class', 'userlist-li');
    userIcon.setAttribute('class', 'fas fa-user');
    plusIcon.setAttribute('class', 'fas fa-plus');
    minusIcon.setAttribute('class', 'fas fa-minus');

    plusIconDiv.onclick = function () { addFriend(uid); }
    minusIconDiv.onclick = function () { removeFriend(uid); }

    plusIconDiv.setAttribute('id', uid + '-add');
    minusIconDiv.setAttribute('id', uid + '-remove');
    plusIconDiv.setAttribute('class', 'userlist-plus');
    minusIconDiv.setAttribute('class', 'userlist-minus');

    li.appendChild(document.createTextNode(displayName));

    plusIconDiv.appendChild(plusIcon);
    minusIconDiv.appendChild(minusIcon);

    div.appendChild(userIcon);
    div.appendChild(li);
    div.appendChild(plusIconDiv);
    div.appendChild(minusIconDiv);

    ul.appendChild(div);
}

function addFriend(uid) {
    document.getElementById(uid + '-add').style.display = 'none';
    document.getElementById(uid + '-remove').style.display = 'block';

    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('users').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // copying friend array
        let myArray = currentUser.friends;

        // adding uid to array
        myArray.push(uid);

        // updating array in firebase
        database.collection('users').doc(currentUserId).update({
            friends: myArray
        });
    });
}

function removeFriend(uid) {
    document.getElementById(uid + '-remove').style.display = 'none';
    document.getElementById(uid + '-add').style.display = 'block';

    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('users').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // copying friend array
        let myArray = currentUser.friends;

        // removing uid from array
        let index = myArray.indexOf(uid);
        if (index > -1) {
            myArray.splice(index, 1);
        }

        // updating array in firebase
        database.collection('users').doc(currentUserId).update({
            friends: myArray
        });
    });
}

/* SETTINGS page Functions */
function toSettingsPage() {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('users').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();
        document.getElementById('displayName-setting-input').value = currentUser.displayName;
    });

    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        hidePages();

        // setting values to data from firebase
        document.getElementById('trackScores-toggle').checked = currentUser.trackScores;
        document.getElementById('shareBirdiesMINUS-toggle').checked = currentUser.shareBirdiesMINUS;
        document.getElementById('sharePars-toggle').checked = currentUser.sharePars;
        document.getElementById('shareBogeys-toggle').checked = currentUser.shareBogeys;
        document.getElementById('shareDoubleBogeysPLUS-toggle').checked = currentUser.shareDoubleBogeysPLUS;
        document.getElementById('trackPutts-toggle').checked = currentUser.trackPutts;
        document.getElementById('shareOnePutts-toggle').checked = currentUser.shareOnePutts;
        document.getElementById('shareTwoPutts-toggle').checked = currentUser.shareTwoPutts;
        document.getElementById('shareThreePuttsPLUS-toggle').checked = currentUser.shareThreePuttsPLUS;
        document.getElementById('trackHolesWithHazard-toggle').checked = currentUser.trackHolesWithHazard;
        document.getElementById('shareHolesWithHazard-toggle').checked = currentUser.shareHolesWithHazard;
        document.getElementById('trackFairwaysInReg-toggle').checked = currentUser.trackFairwaysInReg;
        document.getElementById('shareFairwaysInReg-toggle').checked = currentUser.shareFairwaysInReg;
        document.getElementById('trackGreensInReg-toggle').checked = currentUser.trackGreensInReg;
        document.getElementById('shareGreensInReg-toggle').checked = currentUser.shareGreensInReg;

        // check if share labels or buttons should be changed
        checkTrackScores();
        checkTrackPutts();
        checkTrackFairwaysInReg();
        checkTrackGreensInReg();
        checkTrackHolesWithHazard();

        // display new content
        document.getElementById('settings-page').style.display = 'block';
        document.getElementById('page-label').innerHTML = "Settings";
    });
}

// update user settings in firebase
function saveSettings() {
    // if user leaves setting blank, then don't change it
    const newDisplayName = document.getElementById('displayName-setting-input').value;

    const currentUserId = auth.currentUser.uid;
    if (newDisplayName != "") {
        database.collection('users').doc(currentUserId).update({
            displayName: newDisplayName
        });
    }

    database.collection('userData').doc(currentUserId).update({
        trackScores: document.getElementById('trackScores-toggle').checked,
        shareBirdiesMINUS: document.getElementById('shareBirdiesMINUS-toggle').checked,
        sharePars: document.getElementById('sharePars-toggle').checked,
        shareBogeys: document.getElementById('shareBogeys-toggle').checked,
        shareDoubleBogeysPLUS: document.getElementById('shareDoubleBogeysPLUS-toggle').checked,
        trackPutts: document.getElementById('trackPutts-toggle').checked,
        shareOnePutts: document.getElementById('shareOnePutts-toggle').checked,
        shareTwoPutts: document.getElementById('shareTwoPutts-toggle').checked,
        shareThreePuttsPLUS: document.getElementById('shareThreePuttsPLUS-toggle').checked,
        trackHolesWithHazard: document.getElementById('trackHolesWithHazard-toggle').checked,
        shareHolesWithHazard: document.getElementById('shareHolesWithHazard-toggle').checked,
        trackFairwaysInReg: document.getElementById('trackFairwaysInReg-toggle').checked,
        shareFairwaysInReg: document.getElementById('shareFairwaysInReg-toggle').checked,
        trackGreensInReg: document.getElementById('trackGreensInReg-toggle').checked,
        shareGreensInReg: document.getElementById('shareGreensInReg-toggle').checked,
    });

    toHomePage();
}

// checking track settings... if tracking is off, then turn off sharing also
function checkTrackScores() {
    if (!document.getElementById('trackScores-toggle').checked) {
        // setting all share score settings to false
        $(".score-setting-toggle").each(function () {
            $(this).prop("checked", false);
        });

        // setting all share score settings labels to gray and line through
        $(".score-setting-label").each(function () {
            $(this).css("color", "rgb(215, 215, 215)");
            $(this).css("text-decoration", "line-through");
        });
    }
    else {
        // setting all share score settings labels to original style
        $(".score-setting-label").each(function () {
            $(this).css("color", "rgb(255, 255, 255)");
            $(this).css("text-decoration", "none");
        });
    }
}

function checkTrackPutts() {
    if (!document.getElementById('trackPutts-toggle').checked) {
        // setting all share putt settings to false
        $(".putt-setting-toggle").each(function () {
            $(this).prop("checked", false);
        });

        // setting all share putts settings labels to gray and line through
        $(".putt-setting-label").each(function () {
            $(this).css("color", "rgb(215, 215, 215)");
            $(this).css("text-decoration", "line-through");
        });
    }
    else {
        // setting all share putt settings labels to original style
        $(".putt-setting-label").each(function () {
            $(this).css("color", "rgb(255, 255, 255)");
            $(this).css("text-decoration", "none");
        });
    }
}

function checkTrackFairwaysInReg() {
    if (!document.getElementById('trackFairwaysInReg-toggle').checked) {
        // setting share FIR setting to false
        $("#shareFairwaysInReg-toggle").prop("checked", false);

        // setting share FIR setting label to gray and line through
        $("#shareFairwaysInReg-label").css("color", "rgb(215, 215, 215)");
        $("#shareFairwaysInReg-label").css("text-decoration", "line-through");
    }
    else {
        // setting share FIR setting label to original style
        $("#shareFairwaysInReg-label").css("color", "rgb(255, 255, 255)");
        $("#shareFairwaysInReg-label").css("text-decoration", "none");
    }
}

function checkTrackGreensInReg() {
    if (!document.getElementById('trackGreensInReg-toggle').checked) {
        // setting share GIR setting to false
        $("#shareGreensInReg-toggle").prop("checked", false);

        // setting share GIR setting label to gray and line through
        $("#shareGreensinReg-label").css("color", "rgb(215, 215, 215)");
        $("#shareGreensinReg-label").css("text-decoration", "line-through");
    }
    else {
        // setting share GIR setting label to original style
        $("#shareGreensinReg-label").css("color", "rgb(255, 255, 255)");
        $("#shareGreensinReg-label").css("text-decoration", "none");
    }
}

function checkTrackHolesWithHazard() {
    if (!document.getElementById('trackHolesWithHazard-toggle').checked) {
        // setting share holes with hazard setting to false
        $("#shareHolesWithHazard-toggle").prop("checked", false);

        // setting share holes with hazard setting label to gray and line through
        $("#shareHolesWithHazard-label").css("color", "rgb(215, 215, 215)");
        $("#shareHolesWithHazard-label").css("text-decoration", "line-through");
    }
    else {
        // setting share holes with hazard setting label to original style
        $("#shareHolesWithHazard-label").css("color", "rgb(255, 255, 255)");
        $("#shareHolesWithHazard-label").css("text-decoration", "none");
    }
}

/* NEW ROUND page Functions */
function toNewRoundPage() {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // hide home-page - (only accessible from home page)
        document.getElementById('home-page').style.display = 'none';

        // fixes issue of going to newRound page and then changing settings
        document.getElementById('Q1').style.display = 'none';
        document.getElementById('Q2').style.display = 'none';
        document.getElementById('Q3').style.display = 'none';
        document.getElementById('Q4').style.display = 'none';
        document.getElementById('Q5').style.display = 'none';

        // reset all current values
        database.collection('userData').doc(currentUserId).update({
            currentOnePutts: 0,
            currentTwoPutts: 0,
            currentThreePuttsPLUS: 0,
            currentBirdiesMINUS: 0,
            currentPars: 0,
            currentBogeys: 0,
            currentDoubleBogeysPLUS: 0,
            currentHolesWithHazard: 0,
            currentFairwaysInReg: 0,
            currentGreensInReg: 0,
            currentTotalHolesPlayed: 0
        });

        // display new content
        document.getElementById('newRound-page').style.display = 'flex';
        document.getElementById('page-label').innerHTML = "New Round";

        // display first question
        if (currentUser.trackScores) {
            document.getElementById('Q1').style.display = 'flex';
        }
        else if (currentUser.trackPutts) {
            document.getElementById('Q2').style.display = 'flex';
        }
        else if (currentUser.trackFairwaysInReg) {
            document.getElementById('Q3').style.display = 'flex';
        }
        else if (currentUser.trackGreensInReg) {
            document.getElementById('Q4').style.display = 'flex';
        }
        else if (currentUser.trackHolesWithHazard) {
            document.getElementById('Q5').style.display = 'flex';
        }
        else { // not tracking anything
            document.getElementById("hole-number-text").style.display = 'none';
            document.getElementById("newRound-error-full").style.display = 'flex';
            document.getElementById("newRound-error").innerHTML = 'It looks like you are not tracking any stats. Update your settings to start a new round.'
            sleep(4).then(() => {
                document.getElementById("newRound-error-full").style.display = 'none';
                toSettingsPage();
            });
        }
    });
}

function nextQuestion(prevQuestion) {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // getting number of last question
        var lastQuestion;
        if (currentUser.trackHolesWithHazard) {
            lastQuestion = 5;
        }
        else if (currentUser.trackGreensInReg) {
            lastQuestion = 4;
        }
        else if (currentUser.trackFairwaysInReg) {
            lastQuestion = 3;
        }
        else if (currentUser.trackPutts) {
            lastQuestion = 2;
        }
        else {
            lastQuestion = 1;
        }

        // if previous question is not the last, then go to next
        if (lastQuestion != prevQuestion) {
            if (prevQuestion == 1) {
                document.getElementById('Q1').style.display = 'none';

                if (currentUser.trackPutts) {
                    document.getElementById('Q2').style.display = 'flex';
                }
                else if (currentUser.trackFairwaysInReg) {
                    document.getElementById('Q3').style.display = 'flex';
                }
                else if (currentUser.trackGreensInReg) {
                    document.getElementById('Q4').style.display = 'flex';
                }
                else if (currentUser.trackHolesWithHazard) {
                    document.getElementById('Q5').style.display = 'flex';
                }

                // increase total holes played with tracking scores
                database.collection('userData').doc(currentUserId).update({
                    totalHolesPlayed_scores: currentUser.totalHolesPlayed_scores + 1
                });
            }
            else if (prevQuestion == 2) {
                document.getElementById('Q2').style.display = 'none';

                if (currentUser.trackFairwaysInReg) {
                    document.getElementById('Q3').style.display = 'flex';
                }
                else if (currentUser.trackGreensInReg) {
                    document.getElementById('Q4').style.display = 'flex';
                }
                else if (currentUser.trackHolesWithHazard) {
                    document.getElementById('Q5').style.display = 'flex';
                }

                // increase total holes played with tracking putts
                database.collection('userData').doc(currentUserId).update({
                    totalHolesPlayed_putts: currentUser.totalHolesPlayed_putts + 1
                });
            }
            else if (prevQuestion == 3) {
                document.getElementById('Q3').style.display = 'none';

                if (currentUser.trackGreensInReg) {
                    document.getElementById('Q4').style.display = 'flex';
                }
                else if (currentUser.trackHolesWithHazard) {
                    document.getElementById('Q5').style.display = 'flex';
                }

                // increase total holes played with tracking fairways in regulation
                database.collection('userData').doc(currentUserId).update({
                    totalHolesPlayed_fairwaysInReg: currentUser.totalHolesPlayed_fairwaysInReg + 1
                });
            }
            else if (prevQuestion == 4) {
                document.getElementById('Q4').style.display = 'none';

                if (currentUser.trackHolesWithHazard) {
                    document.getElementById('Q5').style.display = 'flex';
                }

                // increase total holes played with tracking greens in regulation
                database.collection('userData').doc(currentUserId).update({
                    totalHolesPlayed_greensInReg: currentUser.totalHolesPlayed_greensInReg + 1
                });
            }
        }
        else { // if it is the last question
            // hide the last question
            switch (lastQuestion) {
                case 5:
                    document.getElementById('Q5').style.display = 'none';
                    // increase total holes played with tracking holes with hazards
                    database.collection('userData').doc(currentUserId).update({
                        totalHolesPlayed_holesWithHazard: currentUser.totalHolesPlayed_holesWithHazard + 1
                    });
                    break;
                case 4:
                    document.getElementById('Q4').style.display = 'none';
                    // increase total holes played with tracking greens in regulation
                    database.collection('userData').doc(currentUserId).update({
                        totalHolesPlayed_greensInReg: currentUser.totalHolesPlayed_greensInReg + 1
                    });
                    break;
                case 3:
                    document.getElementById('Q3').style.display = 'none';
                    // increase total holes played with tracking scores
                    database.collection('userData').doc(currentUserId).update({
                        totalHolesPlayed_fairwaysInReg: currentUser.totalHolesPlayed_fairwaysInReg + 1
                    });
                    break;
                case 2:
                    document.getElementById('Q2').style.display = 'none';
                    // increase total holes played with tracking putts
                    database.collection('userData').doc(currentUserId).update({
                        totalHolesPlayed_putts: currentUser.totalHolesPlayed_putts + 1
                    });
                    break;
                case 1:
                    // increase total holes played with tracking scores
                    database.collection('userData').doc(currentUserId).update({
                        totalHolesPlayed_scores: currentUser.totalHolesPlayed_scores + 1
                    });
            }

            // display messages at 9 and 18 holes, instead of going to next hole
            const holeNum = document.getElementById('hole-number').innerHTML;

            if (holeNum == 9) {
                document.getElementById('hole-number-text').style.display = 'none';
                document.getElementById('nine-hole-message').style.display = 'flex';
            }
            else if (holeNum == 18) {
                document.getElementById('hole-number-text').style.display = 'none';
                document.getElementById('round-end-message').style.display = 'flex';
            }
            else {
                // going back to first question
                if (currentUser.trackScores) {
                    document.getElementById('Q1').style.display = 'flex';
                }
                else if (currentUser.trackPutts) {
                    document.getElementById('Q2').style.display = 'flex';
                }
                else if (currentUser.trackFairwaysInReg) {
                    document.getElementById('Q3').style.display = 'flex';
                }
                else if (currentUser.trackGreensInReg) {
                    document.getElementById('Q4').style.display = 'flex';
                }
                else if (currentUser.trackHolesWithHazard) {
                    document.getElementById('Q5').style.display = 'flex';
                }
            }

            // increasing hole # by 1
            document.getElementById('hole-number').innerHTML++;

            database.collection('userData').doc(currentUserId).update({
                currentTotalHolesPlayed: currentUser.currentTotalHolesPlayed + 1
            });
        }
    });
}

function makeTheTurn() {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        document.getElementById('nine-hole-message').style.display = 'none';
        document.getElementById('hole-number-text').style.display = 'flex';

        // go back to first question
        if (currentUser.trackScores) {
            document.getElementById('Q1').style.display = 'flex';
        }
        else if (currentUser.trackPutts) {
            document.getElementById('Q2').style.display = 'flex';
        }
        else if (currentUser.trackFairwaysInReg) {
            document.getElementById('Q3').style.display = 'flex';
        }
        else if (currentUser.trackGreensInReg) {
            document.getElementById('Q4').style.display = 'flex';
        }
        else if (currentUser.trackHolesWithHazard) {
            document.getElementById('Q5').style.display = 'flex';
        }
    });
}

function finishRound() {
    document.getElementById('nine-hole-message').style.display = 'none';
    document.getElementById('round-end-message').style.display = 'flex';
}

function submitScore() {
    // get values from input
    const parOptions = document.getElementsByName('par-option');
    const scoreOptions = document.getElementsByName('score-option');
    var parValue = null;
    var scoreValue = null;

    for (var i = 0; i < parOptions.length; i++) {
        if (parOptions[i].checked) {
            parValue = parseInt(parOptions[i].value);
            parOptions[i].checked = false;
            break;
        }
    }

    for (var i = 0; i < scoreOptions.length; i++) {
        if (scoreOptions[i].checked) {
            scoreValue = parseInt(scoreOptions[i].value);
            scoreOptions[i].checked = false;
            break;
        }
    }

    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        if (parValue != null && scoreValue != null) {
            // update to new values
            if (scoreValue < parValue) { // birdie or less
                database.collection('userData').doc(currentUserId).update({
                    birdiesMINUS: currentUser.birdiesMINUS + 1,
                    currentBirdiesMINUS: currentUser.currentBirdiesMINUS + 1
                });
            }
            else if (scoreValue == parValue) { // par
                database.collection('userData').doc(currentUserId).update({
                    pars: currentUser.pars + 1,
                    currentPars: currentUser.currentPars + 1
                });
            }
            else if (scoreValue == (parValue + 1)) { // bogey
                database.collection('userData').doc(currentUserId).update({
                    bogeys: currentUser.bogeys + 1,
                    currentBogeys: currentUser.currentBogeys + 1
                });
            }
            else { // double bogey or more
                database.collection('userData').doc(currentUserId).update({
                    doubleBogeysPLUS: currentUser.doubleBogeysPLUS + 1,
                    currentDoubleBogeysPLUS: currentUser.currentDoubleBogeysPLUS + 1
                });
            }
            nextQuestion(1);
        }
        else { // display error message
            document.getElementById("hole-number-text").style.display = 'none';
            document.getElementById("Q1").style.display = 'none';
            document.getElementById("newRound-error-full").style.display = 'flex';
            document.getElementById("newRound-error").innerHTML = 'You must enter a par and score for this hole before moving on.';
            sleep(3).then(() => {
                document.getElementById("newRound-error-full").style.display = 'none';
                document.getElementById("Q1").style.display = 'flex';
                document.getElementById("hole-number-text").style.display = 'flex';
            })
        }
    });
}

function submitPutts(puttsNum) {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // update to new values
        if (puttsNum == 1) {
            database.collection('userData').doc(currentUserId).update({
                onePutts: currentUser.onePutts + 1,
                currentOnePutts: currentUser.currentOnePutts + 1
            });
        }
        else if (puttsNum == 2) {
            database.collection('userData').doc(currentUserId).update({
                twoPutts: currentUser.twoPutts + 1,
                currentTwoPutts: currentUser.currentTwoPutts + 1
            });
        }
        else { // 3+
            database.collection('userData').doc(currentUserId).update({
                threePuttsPLUS: currentUser.threePuttsPLUS + 1,
                currentThreePuttsPLUS: currentUser.currentThreePuttsPLUS + 1
            });
        }
    });

    nextQuestion(2);
}

function questionYes(questionNum) {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // update to new values
        if (questionNum == 3) { // fairways in regulation
            database.collection('userData').doc(currentUserId).update({
                fairwaysInReg: currentUser.fairwaysInReg + 1,
                currentFairwaysInReg: currentUser.currentFairwaysInReg + 1
            });
        }
        else if (questionNum == 4) { // greens in regulation
            database.collection('userData').doc(currentUserId).update({
                greensInReg: currentUser.greensInReg + 1,
                currentGreensInReg: currentUser.currentGreensInReg + 1
            });
        }
        else { // hazards
            database.collection('userData').doc(currentUserId).update({
                holesWithHazard: currentUser.holesWithHazard + 1,
                currentHolesWithHazard: currentUser.currentHolesWithHazard + 1
            });
        }
    });

    nextQuestion(questionNum);
}

/* STATS page Functions */
function toStatsPage() {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // hiding pages - (only accessible from home page and to newRound page)
        document.getElementById('home-page').style.display = 'none';
        document.getElementById('newRound-page').style.display = 'none';

        // only show stats that are being tracked
        checkStatTracking('scores-stat-btn', currentUser.trackScores);
        checkStatTracking('putts-stat-btn', currentUser.trackPutts);
        checkStatTracking('greensInReg-stat-btn', currentUser.trackGreensInReg);
        checkStatTracking('fairwaysInReg-stat-btn', currentUser.trackFairwaysInReg);
        checkStatTracking('holesWithHazards-stat-btn', currentUser.trackHolesWithHazard);

        // display new content
        document.getElementById('stats-page').style.display = 'flex';
        document.getElementById('page-label').innerHTML = "Stats";

        // load first stat
        var firstStat;
        if (currentUser.trackScores) {
            firstStat = 'pars';
        }
        else if (currentUser.trackPutts) {
            firstStat = 'twoPutts';
        }
        else if (currentUser.trackFairwaysInReg) {
            firstStat = 'fairwaysinReg';
        }
        else if (currentUser.trackGreensInReg) {
            firstStat = 'greensinReg';
        }
        else if (currentUser.trackHolesWithHazard) {
            firstStat = 'holesWithHazards';
        }
        else { // not tracking anything
            document.getElementById("stats-container").style.display = 'none';
            document.getElementById("track-error-full").style.display = 'flex';
            sleep(4).then(() => {
                document.getElementById("track-error-full").style.display = 'none';
                toSettingsPage();
            });
        }

        // setting size of wheels to 75% of div height
        const divHeight = $(".stats-content").height() * 0.70;
        $('#currentPercentageWheel').attr('data-size', (0.75 * divHeight));
        $('#lifetimePercentageWheel').attr('data-size', (0.75 * divHeight));
        $('#outerFriendsPercentageWheel').attr('data-size', (0.75 * divHeight));
        $('#innerFriendsPercentageWheel').attr('data-size', ((0.75 * divHeight) - 30));

        // load first stats and friends page
        changePercentCircle('current', firstStat);
        changePercentCircle('lifetime', firstStat);
        loadFriendsTab();
        backToFriends();
    });
}

function checkStatTracking(elementsName, condition) {
    const elements = document.getElementsByClassName(elementsName);
    for (let i = 0; i < elements.length; i++) {
        if (!condition) {
            elements[i].style.display = 'none';
        }
        else {
            elements[i].style.display = 'block';
        }
    }
}

function newStatsTab(pageName, element) {
    // hide all drop downs
    hideDropdowns();

    // hide all tab content
    const statsContents = document.getElementsByClassName('stats-content');
    for (let i = 0; i < statsContents.length; i++) {
        statsContents[i].style.display = 'none';
    }

    // reseting text and background color of all tabs
    const statsTabs = document.getElementsByClassName('stats-tab');
    for (let i = 0; i < statsTabs.length; i++) {
        statsTabs[i].style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        statsTabs[i].style.color = '#ffffff';
    }

    // displaying new tab content
    document.getElementById(pageName).style.display = 'flex';

    // setting tab to active color
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
}

function hideDropdowns() {
    $(".putts-dropdown-content").each(function () {
        $(this).removeClass("show");
    });

    $(".scores-dropdown-content").each(function () {
        $(this).removeClass("show");
    });
}

function showScoreStatsOptions() {
    $(".putts-dropdown-content").each(function () {
        $(this).removeClass("show");
    });

    $(".scores-dropdown-content").each(function () {
        $(this).toggleClass("show");
    });
}

function showPuttStatsOptions() {
    $(".scores-dropdown-content").each(function () {
        $(this).removeClass("show");
    });

    $(".putts-dropdown-content").each(function () {
        $(this).toggleClass("show");
    });
}

function changePercentCircle(tab, stat) {
    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // hide drop downs
        hideDropdowns();

        // setting values for wheel and label
        if (tab == 'current') {
            var statName, numerator, percentage;

            if (stat == 'birdies') {
                statName = "Birdies or lower";
                numerator = currentUser.currentBirdiesMINUS;
            }
            else if (stat == 'pars') {
                statName = "Pars";
                numerator = currentUser.currentPars;
            }
            else if (stat == 'bogeys') {
                statName = "Bogeys";
                numerator = currentUser.currentBogeys;
            }
            else if (stat == 'doubleBogeys') {
                statName = "Double Bogeys or higher";
                numerator = currentUser.currentDoubleBogeysPLUS;
            }
            else if (stat == 'onePutts') {
                statName = "1 Putts";
                numerator = currentUser.currentOnePutts;
            }
            else if (stat == 'twoPutts') {
                statName = "2 Putts";
                numerator = currentUser.currentTwoPutts;
            }
            else if (stat == 'threePutts') {
                statName = "3 Putts or more";
                numerator = currentUser.currentThreePuttsPLUS;
            }
            else if (stat == 'greensinReg') {
                statName = "Greens in Regulation";
                numerator = currentUser.currentGreensInReg;
            }
            else if (stat == 'fairwaysinReg') {
                statName = "Fairways in Regulation";
                numerator = currentUser.currentFairwaysInReg;
            }
            else if (stat == 'holesWithHazards') {
                statName = "Holes with Hazards";
                numerator = currentUser.currentHolesWithHazard;
            }

            // setting percentage
            percentage = numerator / currentUser.currentTotalHolesPlayed;

            // setting wheel text
            document.getElementById('currentPercentageWheel-text').innerHTML = String(numerator + ' / ' + currentUser.currentTotalHolesPlayed);

            // setting stat name
            document.getElementById("current-stat-name").innerHTML = statName;

            // hiding numbers
            document.getElementById('currentPercentageWheel-text').style.visibility = 'hidden';

            // initially set wheel to 0 with no animation
            $("#currentPercentageWheel").circleProgress({ value: 0, animation: { duration: 0 } });

            if (currentUser.currentTotalHolesPlayed == 0) { // NaN
                document.getElementById('currentPercentageWheel-percent').innerHTML = String('N/A');
            }
            else if (numerator == 0) { // 0%
                document.getElementById('currentPercentageWheel-percent').innerHTML = String('0%');
                document.getElementById('currentPercentageWheel-text').style.visibility = 'visible';
            }
            else {
                // wheel animation
                $("#currentPercentageWheel").circleProgress({ animation: { duration: 975 }, fill: { color: '#3b8ad9' }, value: percentage })
                    .on('circle-animation-progress', function (event, progress, stepValue) {
                        document.getElementById('currentPercentageWheel-percent').innerHTML = String(stepValue.toFixed(5).substr(2, 2) + '.' + stepValue.toFixed(5).substr(4, 2) + '%');
                    });
                sleep(1).then(() => { // when animation ends
                    // override conditions
                    if (percentage == 1) { // 100%
                        document.getElementById('currentPercentageWheel-percent').innerHTML = String('100.00%');
                    }
                    else { // normal
                        document.getElementById('currentPercentageWheel-percent').innerHTML = String((percentage * 100).toFixed(2) + '%');
                    }

                    document.getElementById('currentPercentageWheel-text').style.visibility = 'visible';
                });
            }
        }
        else if (tab == 'lifetime') {
            var statName, numerator, denominator, percentage;

            // setting values for wheel and label
            if (stat == 'birdies') {
                statName = "Birdies or lower";
                numerator = currentUser.birdiesMINUS;
                denominator = currentUser.totalHolesPlayed_scores;
            }
            else if (stat == 'pars') {
                statName = "Pars";
                numerator = currentUser.pars;
                denominator = currentUser.totalHolesPlayed_scores;
            }
            else if (stat == 'bogeys') {
                statName = "Bogeys";
                numerator = currentUser.bogeys;
                denominator = currentUser.totalHolesPlayed_scores;
            }
            else if (stat == 'doubleBogeys') {
                statName = "Double Bogeys or higher";
                numerator = currentUser.doubleBogeysPLUS;
                denominator = currentUser.totalHolesPlayed_scores;
            }
            else if (stat == 'onePutts') {
                statName = "1 Putts";
                numerator = currentUser.onePutts;
                denominator = currentUser.totalHolesPlayed_putts;
            }
            else if (stat == 'twoPutts') {
                statName = "2 Putts";
                numerator = currentUser.twoPutts;
                denominator = currentUser.totalHolesPlayed_putts;
            }
            else if (stat == 'threePutts') {
                statName = "3 Putts or more";
                numerator = currentUser.threePuttsPLUS;
                denominator = currentUser.totalHolesPlayed_putts;
            }
            else if (stat == 'greensinReg') {
                statName = "Greens in Regulation";
                numerator = currentUser.greensInReg;
                denominator = currentUser.totalHolesPlayed_greensInReg;
            }
            else if (stat == 'fairwaysinReg') {
                statName = "Fairways in Regulation";
                numerator = currentUser.fairwaysInReg;
                denominator = currentUser.totalHolesPlayed_fairwaysInReg;
            }
            else if (stat == 'holesWithHazards') {
                statName = "Holes with Hazards";
                numerator = currentUser.holesWithHazard;
                denominator = currentUser.totalHolesPlayed_holesWithHazard;
            }

            // setting percentage
            percentage = numerator / denominator;

            document.getElementById('lifetimePercentageWheel-text').innerHTML = String(numerator + ' / ' + denominator);

            // setting stat name
            document.getElementById("lifetime-stat-name").innerHTML = statName;

            // hiding numbers
            document.getElementById('lifetimePercentageWheel-text').style.visibility = 'hidden';

            // initially set wheel to 0 with no animation
            $("#lifetimePercentageWheel").circleProgress({ value: 0, animation: { duration: 0 } });

            if (denominator == 0) { // NaN
                document.getElementById('lifetimePercentageWheel-percent').innerHTML = String('N/A');
            }
            else if (numerator == 0) { // 0%
                document.getElementById('lifetimePercentageWheel-percent').innerHTML = String('0%');
                document.getElementById('lifetimePercentageWheel-text').style.visibility = 'visible';
            }
            else {
                // wheel animation
                $("#lifetimePercentageWheel").circleProgress({ animation: { duration: 975 }, fill: { color: '#3b8ad9' }, value: percentage })
                    .on('circle-animation-progress', function (event, progress, stepValue) {
                        document.getElementById('lifetimePercentageWheel-percent').innerHTML = String(stepValue.toFixed(5).substr(2, 2) + '.' + stepValue.toFixed(5).substr(4, 2) + '%');
                    });
                sleep(1).then(() => { // when animation ends
                    // override conditions
                    if (percentage == 1) { // 100%
                        document.getElementById('lifetimePercentageWheel-percent').innerHTML = String('100.00%');
                    }
                    else { // normal
                        document.getElementById('lifetimePercentageWheel-percent').innerHTML = String((percentage * 100).toFixed(2) + '%');
                    }

                    document.getElementById('lifetimePercentageWheel-text').style.visibility = 'visible';
                });
            }
        }
    });
}

function showFriend(uid, displayName) {
    const ul = document.getElementById("friends-list");

    var div = document.createElement("div");
    var userIconDiv = document.createElement("div");
    var userIcon = document.createElement("i");
    var h1 = document.createElement("h1");

    div.setAttribute('class', 'friendsList-div');
    userIconDiv.setAttribute('class', 'friendsList-icon-div');
    userIcon.setAttribute('class', 'fas fa-user');
    h1.setAttribute('class', 'friendsList-h1');

    userIconDiv.onclick = function () { compareFriendsInfo(uid, displayName); }
    h1.onclick = function () { compareFriendsInfo(uid, displayName); }

    h1.appendChild(document.createTextNode(displayName));

    userIconDiv.appendChild(userIcon);

    div.appendChild(userIconDiv);
    div.appendChild(h1);

    ul.appendChild(div);
}

function backToFriends() {
    document.getElementById('friends-list').style.display = 'flex';
    document.getElementById('compare-friend-tab').style.display = 'none';
}

function loadFriendsTab() {
    // clear div - (solves issue of re-adding divs)
    $('#friends-list').empty();

    // getting current users info
    const currentUserId = auth.currentUser.uid;
    database.collection('users').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // copying friends array
        const myArray = currentUser.friends;

        // if no friends
        if (myArray < 1) {
            document.getElementById('friends-list').style.display = 'none';
            document.getElementById('no-friends-message').style.display = 'block';
        }
        else {
            document.getElementById('no-friends-message').style.display = 'none';
            document.getElementById('friends-list').style.display = 'flex';

            // getting friends info and displaying them
            for (let i in myArray) {
                database.collection('users').doc(myArray[i]).get().then(snapshot => {
                    const friend = snapshot.data();
                    showFriend(myArray[i], friend.displayName);
                });
            }
        }
    });
}

function compareFriendsInfo(uid, displayName) {
    // setting static variable to be used in other functions
    staticFriendUid(uid);

    // setting key to friends displayName
    document.getElementById('friend-displayName-text').innerHTML = displayName;

    // load first stat
    changeFriendPercentCircle('pars');

    // hide original tab
    document.getElementById('friends-list').style.display = 'none';

    // display new tab
    document.getElementById('compare-friend-tab').style.display = 'block';
}

function staticFriendUid(uid) {
    if (uid != null) {
        // static variable - (Unchanged unless user icon is clicked)
        staticFriendUid.retVal = uid;
    }
    else {
        return staticFriendUid.retVal;
    }
}

function changeFriendPercentCircle(stat) {
    const friendUid = staticFriendUid(null);

    // hide all drop downs
    hideDropdowns();

    // hide friend percent and numbers
    document.getElementById('outerFriendsPercentageWheel-text').style.visibility = 'hidden';
    document.getElementById('innerFriendsPercentageWheel-percent').style.visibility = 'hidden';
    document.getElementById('innerFriendsPercentageWheel-text').style.visibility = 'hidden';

    // getting all info
    const currentUserId = auth.currentUser.uid;
    database.collection('userData').doc(currentUserId).get().then(snapshot => {
        const currentUser = snapshot.data();

        // friends info
        database.collection('userData').doc(friendUid).get().then(snapshot => {
            const friend = snapshot.data();

            var statName, numerator, denominator, percentage, friendNumerator, friendDenominator, friendPercentage;

            if (stat == 'birdies') {
                statName = "Birdies or lower";

                numerator = currentUser.birdiesMINUS;
                denominator = currentUser.totalHolesPlayed_scores;

                if (friend.shareBirdiesMINUS) {
                    friendNumerator = friend.birdiesMINUS;
                    friendDenominator = friend.totalHolesPlayed_scores;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'pars') {
                statName = "Pars";

                numerator = currentUser.pars;
                denominator = currentUser.totalHolesPlayed_scores;

                if (friend.sharePars) {
                    friendNumerator = friend.pars;
                    friendDenominator = friend.totalHolesPlayed_scores;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'bogeys') {
                statName = "Bogeys";

                numerator = currentUser.bogeys;
                denominator = currentUser.totalHolesPlayed_scores;

                if (friend.shareBogeys) {
                    friendNumerator = friend.bogeys;
                    friendDenominator = friend.totalHolesPlayed_scores;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'doubleBogeys') {
                statName = "Double Bogeys or higher";

                numerator = currentUser.doubleBogeysPLUS;
                denominator = currentUser.totalHolesPlayed_scores;

                if (friend.shareDoubleBogeysPLUS) {
                    friendNumerator = friend.doubleBogeysPLUS;
                    friendDenominator = friend.totalHolesPlayed_scores;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'onePutts') {
                statName = "1 Putts";

                numerator = currentUser.onePutts;
                denominator = currentUser.totalHolesPlayed_putts;

                if (friend.shareOnePutts) {
                    friendNumerator = friend.onePutts;
                    friendDenominator = friend.totalHolesPlayed_putts;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'twoPutts') {
                statName = "2 Putts";

                numerator = currentUser.twoPutts;
                denominator = currentUser.totalHolesPlayed_putts;

                if (friend.shareTwoPutts) {
                    friendNumerator = friend.twoPutts;
                    friendDenominator = friend.totalHolesPlayed_putts;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'threePutts') {
                statName = "3 Putts or more";

                numerator = currentUser.threePuttsPLUS;
                denominator = currentUser.totalHolesPlayed_putts;

                if (friend.shareThreePuttsPLUS) {
                    friendNumerator = friend.threePuttsPLUS;
                    friendDenominator = friend.totalHolesPlayed_putts;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'greensinReg') {
                statName = "Greens in Regulation";

                numerator = currentUser.greensInReg;
                denominator = currentUser.totalHolesPlayed_greensInReg;

                if (friend.shareGreensInReg) {
                    friendNumerator = friend.greensInReg;
                    friendDenominator = friend.totalHolesPlayed_greensInReg;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'fairwaysinReg') {
                statName = "Fairways in Regulation";

                numerator = currentUser.fairwaysInReg;
                denominator = currentUser.totalHolesPlayed_fairwaysInReg;

                if (friend.shareFairwaysInReg) {
                    friendNumerator = friend.fairwaysInReg;
                    friendDenominator = friend.totalHolesPlayed_fairwaysInReg;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }
            else if (stat == 'holesWithHazards') {
                statName = "Holes with Hazards";

                numerator = currentUser.holesWithHazard;
                denominator = currentUser.totalHolesPlayed_holesWithHazard;

                if (friend.shareHolesWithHazard) {
                    friendNumerator = friend.holesWithHazard;
                    friendDenominator = friend.totalHolesPlayed_holesWithHazard;
                } else { // if not sharing, then set to N/A
                    friendNumerator = 0;
                    friendDenominator = 0;
                }
            }

            // set percentages
            percentage = numerator / denominator;
            friendPercentage = friendNumerator / friendDenominator;

            // set wheel text
            document.getElementById('outerFriendsPercentageWheel-text').innerHTML = String(numerator + ' / ' + denominator);
            document.getElementById('innerFriendsPercentageWheel-text').innerHTML = String(friendNumerator + ' / ' + friendDenominator);

            // setting stat name
            document.getElementById("friends-stat-name").innerHTML = statName;

            // initially set to wheels to 0 with no animation
            $("#outerFriendsPercentageWheel").circleProgress({ value: 0, animation: { duration: 0 } });
            $("#innerFriendsPercentageWheel").circleProgress({ value: 0, animation: { duration: 0 } });

            if (denominator == 0) { // NaN
                document.getElementById('outerFriendsPercentageWheel-percent').innerHTML = String('N/A');
            }
            else if (numerator == 0) { // 0%
                document.getElementById('outerFriendsPercentageWheel-percent').innerHTML = String('0%');
                document.getElementById('outerFriendsPercentageWheel-text').style.visibility = 'visible';
            }
            else { // normal animation
                // wheel animations
                $("#outerFriendsPercentageWheel").circleProgress({ animation: { duration: 975 }, fill: { color: '#3b8ad9' }, value: percentage })
                    .on('circle-animation-progress', function (event, progress, stepValue) {
                        document.getElementById('outerFriendsPercentageWheel-percent').innerHTML = String(stepValue.toFixed(5).substr(2, 2) + '.' + stepValue.toFixed(5).substr(4, 2) + '%');
                    });
                sleep(1).then(() => { // when animation ends
                    // override conditions
                    if (percentage == 1) { // 100%
                        document.getElementById('outerFriendsPercentageWheel-percent').innerHTML = String('100.00%');
                    }
                    else { // normal
                        document.getElementById('outerFriendsPercentageWheel-percent').innerHTML = String((percentage * 100).toFixed(2) + '%');
                    }

                    document.getElementById('outerFriendsPercentageWheel-text').style.visibility = 'visible';
                });
            }
            sleep(1).then(() => {
                document.getElementById('innerFriendsPercentageWheel-percent').style.visibility = 'visible';

                if (friendDenominator == 0) { // NaN
                    document.getElementById('innerFriendsPercentageWheel-percent').innerHTML = String('N/A');
                }
                else if (friendNumerator == 0) { // 0%
                    document.getElementById('innerFriendsPercentageWheel-percent').innerHTML = String('0%');
                    document.getElementById('innerFriendsPercentageWheel-text').style.visibility = 'visible';
                }
                else { // normal animation
                    $("#innerFriendsPercentageWheel").circleProgress({ animation: { duration: 975 }, fill: { color: '#c4a427' }, value: friendPercentage })
                        .on('circle-animation-progress', function (event, progress, stepValue) {
                            document.getElementById('innerFriendsPercentageWheel-percent').innerHTML = String(stepValue.toFixed(5).substr(2, 2) + '.' + stepValue.toFixed(5).substr(4, 2) + '%');
                        });
                    sleep(1).then(() => { // when animation ends
                        // override conditions
                        if (friendPercentage == 1) { // 100%
                            document.getElementById('innerFriendsPercentageWheel-percent').innerHTML = String('100.00%');
                        }
                        else { // normal
                            document.getElementById('innerFriendsPercentageWheel-percent').innerHTML = String((friendPercentage * 100).toFixed(2) + '%');
                        }

                        document.getElementById('innerFriendsPercentageWheel-text').style.visibility = 'visible';
                    });
                }
            });
        });
    });
}