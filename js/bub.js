/* global moment firebase */
$(document).ready(function() {
    $("#search-term").val('');
});
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAEaLLLymyOsvTY7Sj6diL8mCFof9bGQXo",
     authDomain: "projectone-24f58.firebaseapp.com",
     databaseURL: "https://projectone-24f58.firebaseio.com",
     projectId: "projectone-24f58",
     storageBucket: "",
     messagingSenderId: "580211885116"
};

firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();


// --------------------------------------------------------------


// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update your page in real-time when the firebase database changes.
database.ref().on("value", function(snapshot) {


}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

// --------------------------------------------------------------

//fires an overlay and animation when a user searches a term in twitter - Nick
function myLocationCurtain(){
          locationCurtainDiv = $('<div id="intCurtain"><div class="loader"></div></div>');
          console.log("modal fire is working");
          $("#intContainer").html(locationCurtainDiv);
          $("#intCurtain").show();
          setTimeout(function(){
            $("#intCurtain").hide();
          }, 3000);
     }

$("#run-search").on("click", function(event) {
  // Prevent default behavior
  event.preventDefault();

  searchTerm = $("#search-term").val().trim();
  if ($('input:text').val().length == 0) {
    $("#search-term").addClass("error");
    $("#errorHandling").show();
  } else {
   var searchURL = queryURLBase + searchTerm;
   var tweets = runQuery(searchURL);
   console.log(searchTerm);
   $("#search-term").removeClass("error");
   $("#errorHandling").hide();
   //Comment or Uncomment this for the loading overlay - Nick
   myLocationCurtain();
   //pushes search term to header of block below input - Nick
   $("#tweetSubjectHeader").text(searchTerm);
   firebase.database().ref().push({
     searchTerm: searchTerm
   });
   var searchTermsDiv = $("#recentSearch .card-body .container .row .col-sm");
   var searchTextP = $("<p><a class='linkCurated' href='javascript:;' class='linkCurated'>" + "#" + searchTerm + "</a></p>");
   searchTermsDiv.append(searchTextP);
   $("#tweetSubjectHeader").show();
   $("#tweetsLeft").show();
   $("#tweetsRight").show();
   $("#recentSearch").show();
   $("#introduction").hide();
 }
});

var searchTerm = "";
var queryURLBase = "https://dc.ksi.edu/tweets/";

function runQuery(queryURL) {
  //Clears past search
  $("#tweetsLeft").empty();
  $("#tweetsRight").empty();
  // The AJAX function uses the queryURL and GETS the JSON data associated with it.
  // The data then gets stored in the variable called: "tweetData"
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(tweetData) {
    // Logging the URL so we have access to it for troubleshooting
    console.log(tweetData);
    console.log("------------------------------------");
    console.log("URL: " + queryURL);
    console.log("------------------------------------");

    for (var i = 0; i < tweetData.length; i++) {
      console.log(i);
      console.log(tweetData[i].text);
      // send to indico
      var sa = $.ajax({
        url: "https://apiv2.indico.io/sentiment",
        type: "POST",
        async:false,
        data: JSON.stringify({
          "api_key": "cdf3dbb688a5bea7f94cd89da7a4e3a9",
          "data": tweetData[i].text}),
        success: function (data) {
          return data;
        }, error: function(err) {
          console.log(err);
        }
      }).responseText;
      console.log(sa);
      var lrVal = JSON.parse(sa).results;
      var tweetDivLoc;
      if (lrVal > 0.5) {
        tweetDivLoc = $("#tweetsLeft");
      } else {
        tweetDivLoc = $("#tweetsRight");
      }
      var tweetDiv = $("<div class='userTweet'>");
      var tweetAuthorImage = $("<img class='userImage'>");
      tweetAuthorImage.attr("src", tweetData[i].user.profile_image_url_https);
      var tweetAuthor = $("<p class='tweetAuthor'>");
      tweetAuthor.text(tweetData[i].user.name);
      var tweetText = $("<div class='tweetTextWrapper'>");
      var tweetTextP = $("<p class='tweetText'>");
      tweetTextP.text(tweetData[i].text);
      // Percentage
      var tweetTextP2 = $("<p class='indicoPercent'>");
      tweetTextP2.text((lrVal * 100).toFixed(2) + "%");
      tweetText.append(tweetTextP, tweetTextP2);
      // Append the newly created table data to the table row
      tweetDiv.append(tweetAuthorImage, tweetAuthor, tweetText)
      tweetDivLoc.append(tweetDiv);
    }
  });
}

$(".linkCurated").on("click", function() {
  searchTerm = ($(this).text()).substr(1);
  var searchURL = queryURLBase + searchTerm;
  var tweets = runQuery(searchURL);
  console.log(tweets);
  //Comment or Uncomment this for the loading overlay - Nick
  myLocationCurtain();
  //pushes search term to header of block below input - Nick
  $("#tweetSubjectHeader").text(searchTerm);
  $("#tweetSubjectHeader").show();
  $("#tweetsLeft").show();
  $("#tweetsRight").show();
  $("#recentSearch").show();
  $("#introduction").hide();
});
