// post_rating.js
// Functions related to allowing the user to rate posts and displaying ratings

var colors = [{
            "red": 24,
            "green": 93,
            "blue": 204
      },
      {
            "red": 0,
            "green": 255,
            "blue": 0
      }
];

const generate_rating_buttons = function(post_id) {
      var buttons = document.createElement("div");
      buttons.className = "post-rating-button-container";

      for (var i = 0; i < 5; i++) {
            button = document.createElement("button");
            var factor = i / 5;
            var color = "rgba(" +
                  ((colors[1].red * factor) + (colors[0].red * (1 - factor))) + ", " +
                  ((colors[1].green * factor) + (colors[0].green * (1 - factor))) + ", " +
                  ((colors[1].blue * factor) + (colors[0].blue * (1 - factor))) + ", " +
                  "1)";
            button.style = "background-color: " + color + " !important;"
            button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored post-rating-button";
            button.id = "button-" + (i * 25);
            // addEventListener cannot be used
            button.setAttribute("onclick", "rate_post('" + post_id + "', " + (i * 25) + ");");

            if (i == 0) {
                  button.innerHTML += "<i class='material-icons'>remove</i>";
            } else if (i == 4) {
                  button.innerHTML += "<i class='material-icons'>add</i>";
            }

            buttons.appendChild(button);
      };

      return buttons;
}

const rate_post = function(post_id, rating) {
      if (firebase.auth().currentUser) {
            var user_id = firebase.auth().currentUser.uid;
            database.ref("posts/" + post_id + "/ratings/" + user_id).set({
                  "rating": rating
            });
      } else {
            error_dialog("Not logged in", "You must be logged in to rate a post - <a href='login.html'>log in here.</a><br />If you don't have an account, you can <a href='sign-up.html'>create one here.</a>");
      }
}

const update_post_ratings = function() {
      // Wait for current user info to load - if user changes, reload information
      firebase.auth().onAuthStateChanged(
            function(user) {
                  if (user) {
                        // Get list of all posts
                        database.ref("posts").once(
                              "value",
                              function(data) {
                                    var posts = data.val();
                                    // Loop through all posts
                                    Object.keys(posts).forEach(
                                          (key) => {
                                                // Get post from post key
                                                var post = posts[key];
                                                // Listen for changes in current user's rating of post
                                                database.ref("posts/" + key + "/ratings/" + user.uid).on("value", function(rating) {
                                                      if (rating.val()) {
                                                            var post_element = $("#post-" + key);
                                                            if (post_element) {
                                                                  var buttons = $("#post-" + key)
                                                                        .find(".post-rating-button")
                                                                  buttons.css("border-radius", "")
                                                                  buttons.css("filter", "saturate(0.5)")

                                                                  if (rating.val()) {
                                                                        // Now *that's* some function nesting
                                                                        var button = $("#post-" + key)
                                                                              .find("#button-" + rating.val().rating);
                                                                        button.css("border-radius", "100px");
                                                                        button.css("filter", "saturate(1)");
                                                                  }
                                                            }
                                                      }
                                                });
                                          }
                                    );
                              }
                        );
                  }
            }
      );
}