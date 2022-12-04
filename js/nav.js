"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $newStoryForm.hide(); // this will hide new story for if it is open.
  hideAndClearEditForm() // this will hide edit from is open
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  // TK - show actions available to user in the app.
  $userAppActions.show()
  // TK - hides the login/sign up forms when user logs in or signs up. 
  $signupForm.hide();
  $loginForm.hide();
  putStoriesOnPage();
}

// -------------------------------------------------------------------------
// TK - event listener for creating new story form.
$newStoryForm.on('submit', async function (e) {
  e.preventDefault()
    // making sure that all input fields have values, if not return so nothing happens
  if (!$storyAuthor.val()) {
    return $('#missing-author').show();
  } else {
    $('#missing-author').hide(); // if value gets enter on next click hide error message
  }
  if (!$storyTitle.val()) {
    return $('#missing-title').show();
  } else {
    $('#missing-title').hide();
  }
  if (!$storyUrl.val()) {
    return $('#missing-url').show();
  } else {
    $('#missing-url').hide();
  }
  await createNewStory();
})

// TK - showing a form for creating a new story
$submitNewStory.on('click', () => {
  if($newStoryForm.is(':hidden')) {
    $newStoryForm.show();
  } else {
    $newStoryForm.hide();
  }
  hideAndClearEditForm() // this will hide edit from is open
})

// TK- showing the stories favorited by the current user
$favorites.on('click', function() {
  hideAndClearEditForm() // this will hide edit from is open
  $newStoryForm.hide(); // hide new story form if open
  $allStoriesList.empty();
  for (let story of currentUser.favorites) {
    const $favStory = generateStoryMarkup(story);
    $allStoriesList.append($favStory);
  }
  $allStoriesList.show();
})

// TK - showing stories created by current user
// event listener on 'my stories' link in nav bar
$userStories.on('click', function(e){
  // clear the all stories list on the page before populating it with user stories
  $allStoriesList.empty();
  for (let story of currentUser.ownStories) {
      const $userStory = generateStoryMarkup(story);
      $allStoriesList.append($userStory);
  }
  $allStoriesList.show();
  hideAndClearEditForm() // this will hide edit from is open
  $newStoryForm.hide(); // hide new story form if open
});

// open use profile which shows user's name and allows to change user's name
$('#user-profile').on('click', function(e) {
  if ($('#user-profile').is(':hidden')) {
    $('#user-profile').show();
  } else {
    $('#user-profile').hide();
  }  
  $('#current-user-name').text(currentUser.name);
  $('#username').val(currentUser.name);

});

$('#user-profile').on('submit', async function(e) {
  e.preventDefault();
  if (!$('#username').val()) return;
  await updateProfile()
})

// updating user's name
async function updateProfile() {
  const token = currentUser.loginToken;
  const response = await axios({
    url: `${BASE_URL}/users/${currentUser.username}`,
    method: 'PATCH',
    data: {token, user : {
      "name" : $('#username').val(),
    }}
  })
  currentUser.name = response.data.user.name
  $('#current-user-name').text(currentUser.name);
}

// event listener for user profile closer button.
$('#close-profile').on('click', function() {
  $('#user-profile').hide();
})