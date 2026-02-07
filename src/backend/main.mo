import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";
import Time "mo:core/Time";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // --- Types and Internal State ---

  public type PostId = Nat;
  public type MediaType = { #image; #video };

  public type Post = {
    id : PostId;
    title : Text;
    content : Text;
    isLocked : Bool;
    media : [MediaAttachment];
    createdAt : Nat64;
  };

  public type MediaAttachment = {
    file : Storage.ExternalBlob;
    mediaType : MediaType;
  };

  public type UserProfile = {
    name : Text;
  };

  type PostData = {
    title : Text;
    content : Text;
    isLocked : Bool;
    media : [MediaAttachment];
    createdAt : Nat64;
  };

  var nextPostId = 1;
  let posts = Map.empty<PostId, PostData>();
  let entitledUsers = Set.empty<Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // --- User Profile Management ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Authoring/Admin Workflow (Owner only) ---

  public shared ({ caller }) func createPost(title : Text, content : Text, isLocked : Bool) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can create posts");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let postData : PostData = {
      title;
      content;
      isLocked;
      media = [];
      createdAt = toUnixSeconds(Time.now());
    };

    posts.add(postId, postData);
    postId;
  };

  public shared ({ caller }) func updatePost(postId : PostId, title : Text, content : Text, isLocked : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can update posts");
    };

    let existing = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?data) { data };
    };

    let updated = {
      title;
      content;
      isLocked;
      media = existing.media;
      createdAt = existing.createdAt;
    };
    posts.add(postId, updated);
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can delete posts");
    };
    if (not posts.containsKey(postId)) {
      Runtime.trap("Post not found");
    };
    posts.remove(postId);
  };

  // --- Entitlement Management (Owner only) ---

  public shared ({ caller }) func grantAccess(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can grant access");
    };
    entitledUsers.add(user);
  };

  public shared ({ caller }) func revokeAccess(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can revoke access");
    };
    entitledUsers.remove(user);
  };

  public query ({ caller }) func hasAccess(user : Principal) : async Bool {
    // Only allow checking own access or admin checking anyone's access
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own access status");
    };
    entitledUsers.contains(user);
  };

  // --- Media Upload (Owner only) ---

  public shared ({ caller }) func addMediaToPost(postId : PostId, file : Storage.ExternalBlob, mediaType : MediaType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only the owner can upload media");
    };

    let existing = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?data) { data };
    };

    let attachment : MediaAttachment = {
      file;
      mediaType;
    };

    let updatedMedia = existing.media.concat([attachment]);
    posts.add(postId, {
      title = existing.title;
      content = existing.content;
      isLocked = existing.isLocked;
      media = updatedMedia;
      createdAt = existing.createdAt;
    });
  };

  // --- Public Post APIs ---

  public query ({ caller }) func getPost(postId : PostId) : async ?Post {
    switch (posts.get(postId)) {
      case (null) { null };
      case (?data) {
        // For locked posts, hide content unless caller is admin or entitled
        let canViewLocked = AccessControl.isAdmin(accessControlState, caller) or entitledUsers.contains(caller);
        let visibleContent = if (data.isLocked and not canViewLocked) {
          "[Locked content - sign in to view]";
        } else {
          data.content;
        };

        ?{
          id = postId;
          title = data.title;
          content = visibleContent;
          isLocked = data.isLocked;
          media = data.media;
          createdAt = data.createdAt;
        };
      };
    };
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    let postsList = List.empty<Post>();
    let canViewLocked = AccessControl.isAdmin(accessControlState, caller) or entitledUsers.contains(caller);

    for ((postId, data) in posts.entries()) {
      // For locked posts, hide content unless caller is admin or entitled
      let visibleContent = if (data.isLocked and not canViewLocked) {
        "[Locked content - sign in to view]";
      } else {
        data.content;
      };

      postsList.add({
        id = postId;
        title = data.title;
        content = visibleContent;
        isLocked = data.isLocked;
        media = data.media;
        createdAt = data.createdAt;
      });
    };
    postsList.toArray();
  };

  // --- Access-Controlled Locked Post Retrieval ---

  public query ({ caller }) func getLockedPostContent(postId : PostId) : async ?Text {
    switch (posts.get(postId)) {
      case (null) { null };
      case (?data) {
        if (not data.isLocked) {
          // Not a locked post, return content
          ?data.content;
        } else {
          // Locked post - check entitlement
          if (not (AccessControl.isAdmin(accessControlState, caller) or entitledUsers.contains(caller))) {
            Runtime.trap("Unauthorized: Access to locked content requires entitlement");
          };
          ?data.content;
        };
      };
    };
  };

  func toUnixSeconds(time : Time.Time) : Nat64 {
    let seconds = ((time) / 1_000_000_000).toNat();
    Nat64.fromNat(seconds);
  };
};
