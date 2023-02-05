const fetchOptions = {
    credentials: "include",
    headers: {
      "X-IG-App-ID": "936619743392459",
    },
    method: "GET",
  };
  
  let username;
  
  window.resolveInstaScriptPermissions = () => {};
  
  async function execute(fn, ...args) {
    if (window.location.origin !== "https://www.instagram.com") {
      window.alert(
        "You need to be on the instagram site before you run the code."
      );
      window.location.href = "https://www.instagram.com";
      console.clear();
      return;
    }
  
    const permission = new Promise(resolve => (window.resolveInstaScriptPermissions  = resolve));
  
    document.write(`<button onClick="window.resolveInstaScriptPermissions()">Find Unfollowers</button>`);
  
    await permission;
  
  
    document.write("<br/><p>Ok, thanks. Look back at the console to see the output. Refreshing this tab will also make everything go back to normal.</p>")
    return await fn(...args);
  }
  
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const random = (min, max) => Math.ceil(Math.random() * (max - min)) + min;
  
  const concatFriendshipsApiResponse = async (
    list,
    user_id,
    count,
    next_max_id = ""
  ) => {
    let url = `https://www.instagram.com/api/v1/friendships/${user_id}/${list}/?count=${count}`;
    if (next_max_id) {
      url += `&max_id=${next_max_id}`;
    }
  
    const data = await fetch(url, fetchOptions).then((r) => r.json());
  
    if (data.next_max_id) {
      const timeToSleep = random(100, 500);
      console.log(
        `Loaded ${data.users.length} ${list}. Sleeping ${timeToSleep}ms to avoid rate limiting`
      );
  
      await sleep(timeToSleep);
  
      return data.users.concat(
        await concatFriendshipsApiResponse(list, user_id, count, data.next_max_id)
      );
    }
  
    return data.users;
  };
  
  // helper methods to make the code a bit more readable
  const getFollowers = (user_id, count = 50, next_max_id = "") => {
    return concatFriendshipsApiResponse("followers", user_id, count, next_max_id);
  };
  
  const getFollowing = (user_id, count = 50, next_max_id = "") => {
    return concatFriendshipsApiResponse("following", user_id, count, next_max_id);
  };
  
  const getUserId = async (username) => {
    let user = username;
  
    const lower = user.toLowerCase();
    const url = `https://www.instagram.com/api/v1/web/search/topsearch/?context=blended&query=${lower}&include_reel=false`;
    const data = await fetch(url, fetchOptions).then((r) => r.json());
  
    const result = data.users?.find(
      (result) => result.user.username.toLowerCase() === lower
    );
  
    return result?.user?.pk || null;
  };
  
  const getUserFriendshipStats = async (username) => {
    if (username === "example_username") {
      username = window.prompt(
        "It looks like you forgot to change the username variable. No worries, we'll update it right now. What's your username?"
      );
    }
  
    const user_id = await getUserId(username);
  
    if (!user_id) {
      throw new Error(`Could not find user with username ${username}`);
    }
  
    const followers = await getFollowers(user_id);
    const following = await getFollowing(user_id);
  
    const followersUsernames = followers.map((follower) =>
      follower.username.toLowerCase()
    );
    const followingUsernames = following.map((followed) =>
      followed.username.toLowerCase()
    );
  
    const followerSet = new Set(followersUsernames);
    const followingSet = new Set(followingUsernames);
  
    console.log(Array(28).fill("-").join(""));
    console.log(
      `Fetched`,
      followerSet.size,
      "followers and ",
      followingSet.size,
      " following."
    );
  
    const PeopleNotFollowingMeBack = Array.from(followingSet).filter(
      (following) => !followerSet.has(following)
    );
  
    return PeopleNotFollowingMeBack
  };
  
  // Replace "example_username" below with your instagram username
  username = "example_username";
  execute(getUserFriendshipStats, username).then(console.log);