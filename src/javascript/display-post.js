// display_post.js
// Functions for displaying a single post on the individual post page

console.log("Loading post...");

// Get post ID from URL
console.log("Getting post id...");
var post_info;
var post_id = getQueryVariable("id");

// Get post information from Firebase Realtime Database using ID
console.log("Getting post data from database...");
firebase.database().ref("posts/" + post_id).once("value").then(
      (post) => {
            // Get value from post object
            post_info = post.val();
            // Update page title to match post title
            document.title = post_info.title;

            // Get post container HTML element (div#post-container)
            var post_container = $("#post-container");
            post_container.attr("id", "post-" + post_id);

            // Fill in HTML content of post
            console.log("Displaying post post_container...");
            console.log(post);
            post_container.html("\
                  <h1>" + linkifyHtml(post_info.title) + "</h1>\
                  <h3>" + post_note_formatted(post_info) + "</h3>\
                  <h3>" + post_created_formatted(post_info) + "</h3>\
                  <h3>" + post_ratings_formatted(post_info) + "</h3>\
            ");

            // Add post rating buttons to page
            console.log("Adding post rating buttons...");
            post_container[0].appendChild(generate_rating_buttons(post_id));
            // Update buttons to represent current post rating state
            update_post_ratings();

            var post_ownership;
            firebase.auth().onAuthStateChanged(
                  function (user) {
                        if (user) {
                              post_ownership = user.uid == post_info.user_id;
                              if (post_ownership) {
                                    var delete_post_dialog = $("#delete-post-dialog");
                                    // if (! dialog.showModal) {
                                    //       dialogPolyfill.registerDialog(dialog);
                                    // }
                                    delete_post_dialog.find(".close").on("click", function() {
                                          delete_post_dialog[0].close();
                                    });
                                    delete_post_dialog.find(".confirm").on("click", function() {
                                          firebase.database().ref("posts/" + post_id).remove();
                                          delete_post_dialog[0].close();
                                          window.location.href = "index.html";
                                    });

                                    window.display_delete_post_dialog = function (post) {
                                          delete_post_dialog.find(".mdl-dialog__title").text("Delete Post - " + post.title);
                                          delete_post_dialog[0].showModal();
                                    }

                                    post_container[0].innerHTML += '\
                                          <button id="delete-post-button" class="mdl-button mdl-js-button mdl-button--icon warning" onclick="window.display_delete_post_dialog(post_info)">\
                                                <i class="material-icons">delete</i>\
                                          </button>\
                                          <div class="mdl-tooltip" data-mdl-for="delete-post-button">\
                                                Delete post\
                                          </div>\
                                    ';

                                    componentHandler.upgradeDom();
                              }
                        }
                  }
            );

            post_container[0].appendChild(show_share_post(post_info.title, post_id, "single"));
            $("#loading").remove();
            componentHandler.upgradeDom();

            // Log information about post
            console.log("Loaded post " + post_id);
            console.log("Post information: ", post_info);
      }
);
