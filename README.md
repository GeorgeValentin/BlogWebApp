# Full-Stack Blog App

# NOTE on Firebase:

In Firebase:

Each type of data (users, blog posts, comments, tags, categories, likes, and followers/following relationships) is represented as a collection.
References between documents are achieved by storing the unique identifier (e.g., user_id, post_id) as keys with a value of true.

# DB objects:
# -> user (the one who logs in)
# 	- userId
#	- username
# 	- email
#	- password
# 	- phone number
# 	- age
#	- blogPosts[]
# -> blogPost (what the user posts)
#	- postId
# 	- title
# 	- content
# 	- creationTime (date/year)
# 	- likes
#	- comments[]
#	- userId
# -> comment
#	- commentId
#	- content
#	- timeStamp
#	- userId
# 	- postId
# -> Relationship: 
# 	- ONE-to-MANY (User - BlogPost)
#	- ONE-to-MANY (BlogPost - Comment)
#	- ONE-to-ONE (BlogPost - Category)

# Structure:
-> User
"user_id_1": {
    "username": "exampleUser",
    "email": "user@example.com",
    "password": "hashedPassword",
    "phoneNumber": "555-222-1234",
    "age": "15",
    "blog_posts": {
      "post_id_1": true,
      "post_id_2": true,
      // ... more post references
    },
  },

-> BlogPost
  "post_id_1": {
    "title": "Sample Title",
    "content": "Lorem ipsum dolor sit amet...",
    "timestamp": "2023-01-01T12:00:00Z",
    "likes": 100,
    "comments": {
      "comment_id_1": true,
      "comment_id_2": true,
      // ... more comment references
    },
    "author": "user_id_1",
    "category": "category_id_1"
  },


-> Comment
  "comment_id_1": {
    "content": "Great post!",
    "timestamp": "2023-01-02T10:30:00Z",
    "user": "user_id_2",
    "post": "post_id_1"
  },

-> Categories
  "category_id_1": {
    "name": "Programming"
  },