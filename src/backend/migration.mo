import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Nat64 "mo:core/Nat64";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    nextPostId : Nat;
    posts : Map.Map<Nat, OldPostData>;
    entitledUsers : Set.Set<Principal>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type OldPostData = {
    title : Text;
    content : Text;
    isLocked : Bool;
    media : [MediaAttachment];
    createdAt : Nat64;
  };

  type NewActor = {
    nextPostId : Nat;
    posts : Map.Map<Nat, NewPostData>;
    entitledUsers : Set.Set<Principal>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewPostData = {
    title : Text;
    content : Text;
    isLocked : Bool;
    media : [MediaAttachment];
    createdAt : Nat64;
  };

  type MediaAttachment = {
    file : Storage.ExternalBlob;
    mediaType : MediaType;
  };

  type MediaType = { #image; #video };

  public func run(old : OldActor) : NewActor {
    let newPosts = old.posts.map<Nat, OldPostData, NewPostData>(
      func(_postId, postData) {
        // Hardcode createdAt = 1767878400 for posts (08 Jan 2026)
        { postData with createdAt = 1767878400 };
      }
    );
    {
      old with
      posts = newPosts
    };
  };
};
