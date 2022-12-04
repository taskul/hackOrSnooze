"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    const postHostName = this.url.split('/')[2];
    return postHostName;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  // -------------------------------------------------------------------------
  // TK - 
  async addStory(userToken, {author, title, url}) {
    const response = await axios.post(`${BASE_URL}/stories`, {
      token: userToken,
      "story": {
        author,
        title,
        url
      }
    });
    console.log(response)
    const newUserStory = {
      storyId: response.data.story.storyId,
      title: response.data.story.title,
      author: response.data.story.author,
      url: response.data.story.url,
      username: response.data.story.username,
      createdAt: response.data.story.createdAt
    };
    return new Story(newUserStory);
  }

}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    console.log('Static: login')
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    console.log('Static: login')
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // -------------------------------------------------------------------------
  /** adding story to favorites */
  // TK
  addToFavorites(story) {
    this.manageFavoriteStories(story, 'POST');
    this.favorites.push()
  }
  /** removing story from favorites */
  // TK
  removeFromFavorites(story) {
    this.manageFavoriteStories(story, 'DELETE')
  }

  // TK - manages functions related to favorites. 
  async manageFavoriteStories(story, httpMethod) {
    const storyId = story.id
    const token = currentUser.loginToken;
    // sends story to API to be added to user favorites. 
    // or send API request to remove a story from user favorites
    // this depends on what method is passed into the function. 
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
      method: httpMethod,
      data: { token },
  })
  // loops through the response array of user favorite stories
  // and appends them to the current logged in user favorites array
    if (httpMethod === 'POST') {
      // clear the current user favorites array first. 
      currentUser.favorites.splice(0,currentUser.favorites.length)
      for (story of response.data.user.favorites) {
        const newFavStory = new Story({
          storyId: story.storyId,
          title: story.title,
          author: story.author,
          url: story.url,
          username: story.username,
          createdAt: story.createdAt
      });
      currentUser.favorites.push(newFavStory)
      }
    }
    // loop through the local current user favorites and remove story based on id
    if (httpMethod === 'DELETE') {
      for (let i=0; i <currentUser.favorites.length; i++) {
        if(currentUser.favorites[i].storyId === storyId) {
          currentUser.favorites.splice(i,1)
        }
      }
    }
  }

  /** deletes user story from the page and server */
  // TK - sending requset to an API to delete a story
  // sending story id and user token for authentication
  async deleteUserStory(story) {
    const token = currentUser.loginToken;
    const response = await axios({
      url: `${BASE_URL}/stories/${story.id}`,
      method:'DELETE',
      data: {token}
    })
    hideAndClearEditForm() // this will hide edit from is open
    $newStoryForm.hide(); // hide new story form if open
    // then removing the story from DOM of main page locally
    storyList.stories = storyList.stories.filter(localstoredStory => {
      if (localstoredStory.storyId !== story.id) return localstoredStory;
    })
    // then remove story from the user's my stories section. 
    currentUser.ownStories = currentUser.ownStories.filter(localstoredStory => {
      if (localstoredStory.storyId !== story.id) return localstoredStory;
    })
    putStoriesOnPage();
  }

  /** edits user story if the story is by a user */
  // TK - sending a request to API
  async editUserStory(storyId) {
    const token = currentUser.loginToken;
    const response = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'PATCH',
      data: {token, 'story': {
        author: $('#edit-author-name').val(),
        title: $('#edit-story-title').val(),
        url: $('#edit-story-url').val()
        }
      }
    });
    // update storyList with new version of the story locally
    const editedStory = new Story(response.data.story)
    for (let locallyStoredStory of storyList.stories) {
      if (locallyStoredStory.storyId === editedStory.storyId) {
          const storyIndex = storyList.stories.indexOf(locallyStoredStory);
          storyList.stories[storyIndex] = editedStory;
      }
    }
    hideAndClearEditForm()
    $allStoriesList.hide();
    putStoriesOnPage();
  }
}
