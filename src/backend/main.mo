import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  public type SiblingProfile = {
    id : Nat;
    name : Text;
    emoji : Text;
    bio : Text;
  };

  public type Message = {
    id : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
  };

  public type Activity = {
    id : Nat;
    description : Text;
    creator : Text;
  };

  var nextSiblingId = 0;
  var nextMessageId = 0;
  var nextActivityId = 0;

  let siblings = List.empty<SiblingProfile>();
  let messages = List.empty<Message>();
  let activities = List.empty<Activity>();

  // Initialize with some default activities
  public shared ({ caller }) func init() : async () {
    if (activities.isEmpty()) {
      activities.add({
        id = nextActivityId;
        description = "Have a movie night together!";
        creator = "System";
      });
      nextActivityId += 1;

      activities.add({
        id = nextActivityId;
        description = "Plan a treasure hunt at home.";
        creator = "System";
      });
      nextActivityId += 1;
    };
  };

  // Sibling Profiles
  public shared ({ caller }) func addSibling(name : Text, emoji : Text, bio : Text) : async Nat {
    let profile : SiblingProfile = {
      id = nextSiblingId;
      name;
      emoji;
      bio;
    };
    siblings.add(profile);
    nextSiblingId += 1;
    nextSiblingId - 1;
  };

  public query ({ caller }) func listSiblings() : async [SiblingProfile] {
    siblings.toArray();
  };

  public shared ({ caller }) func deleteSibling(id : Nat) : async () {
    let filtered = siblings.filter(
      func(s) {
        s.id != id;
      }
    );
    siblings.clear();
    siblings.addAll(filtered.reverse().values());
  };

  // Message Board
  public shared ({ caller }) func postMessage(author : Text, content : Text) : async Nat {
    let message : Message = {
      id = nextMessageId;
      author;
      content;
      timestamp = Time.now();
    };
    messages.add(message);
    nextMessageId += 1;
    nextMessageId - 1;
  };

  public query ({ caller }) func listMessages() : async [Message] {
    messages.toArray();
  };

  public shared ({ caller }) func deleteMessage(messageId : Nat) : async () {
    let filteredMessages = messages.filter(
      func(msg) {
        msg.id != messageId;
      }
    );
    messages.clear();
    messages.addAll(filteredMessages.reverse().values());
  };

  // Activities
  public shared ({ caller }) func addActivity(description : Text, creator : Text) : async Nat {
    let activity : Activity = {
      id = nextActivityId;
      description;
      creator;
    };
    activities.add(activity);
    nextActivityId += 1;
    nextActivityId - 1;
  };

  public query ({ caller }) func listActivities() : async [Activity] {
    activities.toArray();
  };

  // Get Sibling Profile by ID
  public query ({ caller }) func getSiblingProfile(id : Nat) : async SiblingProfile {
    let found = siblings.filter(
      func(profile) {
        profile.id == id;
      }
    );
    if (found.isEmpty()) {
      Runtime.trap("Sibling profile not found. ");
    } else {
      found.at(0);
    };
  };

  // Get Message by ID
  public query ({ caller }) func getMessage(id : Nat) : async Message {
    let found = messages.filter(
      func(message) {
        message.id == id;
      }
    );
    if (found.isEmpty()) {
      Runtime.trap("Message not found. ");
    } else {
      found.at(0);
    };
  };

  // Get Activity by ID
  public query ({ caller }) func getActivity(id : Nat) : async Activity {
    let found = activities.filter(
      func(activity) {
        activity.id == id;
      }
    );
    if (found.isEmpty()) {
      Runtime.trap("Activity not found. ");
    } else {
      found.at(0);
    };
  };

  // Get Most Recent Messages
  public query ({ caller }) func getRecentMessages(limit : Nat) : async [Message] {
    let values = messages.values();
    let reversed = values.toArray().reverse();
    if (reversed.size() <= limit) {
      return reversed;
    } else {
      return reversed.sliceToArray(0, limit);
    };
  };

  // Get Stats
  public query ({ caller }) func getStats() : async {
    totalSiblings : Nat;
    totalMessages : Nat;
    totalActivities : Nat;
  } {
    {
      totalSiblings = siblings.size();
      totalMessages = messages.size();
      totalActivities = activities.size();
    };
  };
};
