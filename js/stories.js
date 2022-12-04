"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// TK - This is the global list for favorite stories
let favoriteStoriesList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories(); // why do we not need to put "new" before StoryList?
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let starIconClass;
  let deleteButton;
  let editButton;

  if (currentUser) {
    console.log('User is logged in')
    starIconClass = favoritedByUser(story) ? 'fas fa-star favorite' : 'far fa-star favorite';
    deleteButton = allowedToDelete(story) ? '':'hidden';
    editButton = allowedToEdit(story) ? '': 'hidden';
  } else {
    deleteButton = 'hidden';
    editButton = 'hidden';
  }
  
  return $(`
      <li id="${story.storyId}">
      <i class="${starIconClass}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small ${deleteButton}><i class="far fa-trash-alt delete"></i></small>
        <small ${editButton}><a class='edit-story'>edit</a></small>
        <small class="story-user">posted by ${story.username}</small>

      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// -------------------------------------------------------------------------
// TK - creates new story by submiting information from the new story form
// and then sending it to an API with user token for authentication, 
async function createNewStory() {
  //  get values from the input fields for the new story. 
  const newStory = {
    author: $storyAuthor.val(),
    title: $storyTitle.val(),
    url: $storyUrl.val(),
  }
  // send user token along with newStory object to an API
  const userStory = await storyList.addStory(currentUser.loginToken, newStory);
  // new StoryList(storyList)
  // adding a new story to the storyList which is an array that holds all of the
  // stories on the page. We add it to the front of the array. 
  storyList.stories.unshift(userStory);
  currentUser.ownStories.unshift(userStory);
  $storiesLoadingMsg.remove();
  // hide page componenets
  hidePageComponents();
  // put stories that are in storyList array onto a page. 
  putStoriesOnPage();
  // clear the new story form. 
  clearNewStoryForm();
  $newStoryForm.hide();

}

// TK - clearing the test in input fieds for the creating new story form
function clearNewStoryForm() {
  $storyAuthor.val('');
  $storyTitle.val('');
  $storyUrl.val('');
}

function favoritedByUser(story) {
  return currentUser.favorites.some((favStory) => {
    return favStory.storyId === story.storyId;
  });
};

function allowedToDelete(story) {
  return currentUser.ownStories.some((ownsStory) => {
    return ownsStory.storyId === story.storyId;
  });
};

function allowedToEdit(story) {
  return currentUser.ownStories.some((ownsStory) => {
    return ownsStory.storyId === story.storyId
  });
};

// TK - adding stories to favorites. 
$allStoriesList.on('click', storyUserActions);

/** favorite actions based on CSS class and class name*/
// Adding stories to favorites
// removing stories from favorites
// deleting a user story if user is the owner of that story
// editing story if user is the owner of that story
function storyUserActions(e) {

  if (e.target.tagName === "I") {
    const story = $(e.target).parent()[0];
    if (e.target.className === 'far fa-star favorite') {
      currentUser.addToFavorites(story);
      e.target.className = 'fas fa-star favorite';
    } else if (e.target.className === 'fas fa-star favorite') {
      currentUser.removeFromFavorites(story);
      e.target.className = 'far fa-star favorite';
    } else if (e.target.className === 'far fa-trash-alt delete') {
      const story = $(e.target).parent().parent()[0];
      currentUser.deleteUserStory(story);
    };
  };
  if (e.target.className === 'edit-story') {
    const story = $(e.target).parent().parent()[0];
    $newStoryForm.hide(); // hide new story form if open
    openEditStoryForm(story);
  };
};

// opens the edit story from and poplulates values from the story 
// into the form. form data attribute hold the story id which can be
// passed on to API for updating the story. 
function openEditStoryForm(story) {
  $('#edit-story-form').show();
  $('#edit-author-name').val(story.children[3].textContent.split(' ').splice(1).join(' '));
  $('#edit-story-title').val(story.children[1].textContent.trim(' '));
  $('#edit-story-url').val(story.children[1].href);
  $('#edit-story-form').data('story-id', story.id)
}

// event listener for edit story from
// first it checks to see if any of the fields are empty
// if field is empty the user gets an error message
// then story id is passed on to editUserStory to send it to API
$('#edit-story-form').on('submit', function(e) {
  e.preventDefault();
  const storyId = $(this).data().storyId
  // making sure that all input fields have values, if not return so nothing happens
  if (!$('#edit-author-name').val()) {
    return $('#missing-author-edit').show();
  } else {
    $('#missing-author-edit').hide(); // if value gets enter on next click hide error message
  }
  if (!$('#edit-story-title').val()) {
    return $('#missing-title-edit').show();
  } else {
    $('#missing-title-edit').hide();
  }
  if (!$('#edit-story-url').val()) {
    return $('#missing-url-edit').show();
  } else {
    $('#missing-url-edit').hide();
  }
  currentUser.editUserStory(storyId)
})

// hides and clears edit story from
// data attribute that holds story id is also cleared. 
function hideAndClearEditForm() {
  $('#edit-author-name').val('');
  $('#edit-story-title').val('');
  $('#edit-story-url').val('');
  $('#edit-story-form').hide();
  $('#edit-story-form').data('story-id', '')
}
